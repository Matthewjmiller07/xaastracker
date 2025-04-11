import { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, TextField, Button, Box, AppBar, Toolbar,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TableSortLabel, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { XaaSEntry, XaaSFormData } from './types';

function App() {
  const [entries, setEntries] = useState<XaaSEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<XaaSEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<keyof XaaSEntry>('product');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<XaaSFormData>({
    product: '',
    xaas: '',
    source: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/xaastracker/xaas-data.csv');
        const csvText = await response.text();
        
        // Split into lines and remove empty ones
        const lines = csvText.split('\n').filter(line => line.trim());
        
        // Remove header row
        const dataLines = lines.slice(1);
        
        // Parse each line
        const parsedEntries = dataLines.map(line => {
          const [product, xaas, source] = line.split(',').map(field => 
            field.trim().replace(/^["']|["']$/g, '')
          );
          return { 
            product: product || '',
            xaas: xaas || '',
            source: source || ''
          };
        }).filter(entry => entry.product && entry.xaas);
        
        console.log('Parsed entries:', parsedEntries);
        setEntries(parsedEntries);
        setFilteredEntries(parsedEntries);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const filtered = entries.filter(entry =>
      entry.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.xaas.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEntries(filtered);
  }, [searchTerm, entries]);

  const handleSort = (property: keyof XaaSEntry) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    const sorted = [...filteredEntries].sort((a, b) => {
      const aValue = (a[property] || '').toLowerCase();
      const bValue = (b[property] || '').toLowerCase();
      return (isAsc ? -1 : 1) * (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
    });
    setFilteredEntries(sorted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = { ...formData };
    
    // Send email
    const emailBody = `
      New XaaS Submission:
      Product: ${newEntry.product}
      XaaS: ${newEntry.xaas}
      Source: ${newEntry.source}
    `;
    
    const mailtoUrl = `mailto:matthewjmiller07@gmail.com?subject=New XaaS Submission&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    
    // Update UI
    setEntries([...entries, newEntry]);
    setFormData({ product: '', xaas: '', source: '' });
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>XaaS Tracker</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 300 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products or XaaS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 1,
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiInputBase-root': { paddingRight: 1 },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            mb: 3
          }}
        >
          Everything as a Service
          <Typography 
            component="span" 
            sx={{ 
              ml: 1,
              color: 'text.secondary',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
            }}
          >
            ({filteredEntries.length} entries)
          </Typography>
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Submit New XaaS</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found a new XaaS? Submit it here and we'll review it for addition to the list.
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Product Name"
              placeholder="e.g., AWS, Google Cloud"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              margin="normal"
              required
              helperText="The name of the product or company"
            />
            <TextField
              fullWidth
              label="XaaS Name"
              placeholder="e.g., Infrastructure as a Service"
              value={formData.xaas}
              onChange={(e) => setFormData({ ...formData, xaas: e.target.value })}
              margin="normal"
              required
              helperText="The 'as a Service' offering name"
            />
            <TextField
              fullWidth
              label="Source URL"
              placeholder="https://..."
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              margin="normal"
              required
              helperText="Link to the product or service page"
              type="url"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
            >
              Submit for Review
            </Button>
          </Box>
        </Paper>

        <TableContainer 
          component={Paper} 
          sx={{ 
            mb: 4,
            boxShadow: 2,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table sx={{ 
            minWidth: { xs: '100%', sm: 650 },
            '& th': { bgcolor: 'grey.100' }
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'product'}
                    direction={orderBy === 'product' ? order : 'asc'}
                    onClick={() => handleSort('product')}
                  >
                    Product
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'xaas'}
                    direction={orderBy === 'xaas' ? order : 'asc'}
                    onClick={() => handleSort('xaas')}
                  >
                    XaaS
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.map((entry, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <TableCell 
                    sx={{ 
                      whiteSpace: 'nowrap',
                      borderLeft: '4px solid transparent',
                      '&:hover': { borderLeft: '4px solid primary.main' }
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {entry.product}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: { xs: '120px', sm: '200px', md: '300px' } }}>
                    <Typography variant="body1" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {entry.xaas}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    {entry.source && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={entry.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          textTransform: 'none',
                          minWidth: 0,
                          px: 2,
                          borderRadius: 4,
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      >
                        Visit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  )
}

export default App
