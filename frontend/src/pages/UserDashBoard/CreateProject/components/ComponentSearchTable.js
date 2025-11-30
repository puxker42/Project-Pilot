import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox
} from '@mui/material';

const ComponentSearchTable = ({ allComponents, search, formData, setFormData }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Available Components
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="center">Select</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allComponents
                .filter(comp => comp.name.toLowerCase().includes(search.toLowerCase()))
                .map((comp, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{comp.name}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={formData.components.some(c => c.name === comp.name)}
                        onChange={(e) => {
                          const selected = formData.components;
                          const already = selected.find(c => c.name === comp.name);
                          if (e.target.checked && !already) {
                            setFormData({
                              ...formData,
                              components: [
                                ...selected,
                                {
                                  name: comp.name,
                                  id: comp.id,
                                  purpose: '',
                                  quantity: 1
                                }
                              ]
                            });
                          } else if (!e.target.checked && already) {
                            setFormData({
                              ...formData,
                              components: selected.filter(c => c.name !== comp.name)
                            });
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ComponentSearchTable;
