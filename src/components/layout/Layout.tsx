import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        //backgroundColor: theme.palette.background.default,
      }}
    >
      <Header

      />
      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};