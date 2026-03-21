import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton, useTheme } from '@mui/material';
import { GitHub, Telegram, Instagram, Email, Favorite } from '@mui/icons-material';

export const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <GitHub />, href: 'https://github.com/chstkhvst', label: 'GitHub' },
    { icon: <Email />, href: 'mailto:22474@gapps.ispu.ru', label: 'Email' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.grey[50],
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
      }}
    >
    <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={4}>
            {/* Логотип и описание */}
            <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Волонтёрский Центр
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Объединяем волонтёров и организаторов.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social) => (
                <IconButton
                    key={social.label}
                    component={Link}
                    href={social.href}
                    target="_blank"
                    size="small"
                    sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': { color: theme.palette.primary.main },
                    }}
                >
                    {social.icon}
                </IconButton>
                ))}
            </Box>
            </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Волонтёрский Центр. Все права защищены.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Сделано с
            </Typography>
            <Favorite sx={{ fontSize: 14, color: theme.palette.error.main }} />
            <Typography variant="body2" color="text.secondary">
              для волонтёров
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};