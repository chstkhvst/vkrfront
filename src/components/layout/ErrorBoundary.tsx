import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { ReportProblem as ReportProblemIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Если предоставлен кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // fallback 
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={2}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600 }}>
            <Box textAlign="center" mb={3}>
              <ReportProblemIcon color="error" sx={{ fontSize: 60 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Что-то пошло не так
              </Typography>
            </Box>

            <Box mb={3}>
              <Typography variant="body1" paragraph>
                Произошла ошибка. Пожалуйста, попробуйте перезагрузить страницу.
              </Typography>
              {this.state.error && (
                <Typography variant="caption" color="textSecondary">
                  {this.state.error.toString()}
                </Typography>
              )}
            </Box>

            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                size="large"
              >
                Попробовать снова
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box mt={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Детали ошибки:
                </Typography>
                <Typography
                  component="pre"
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    p: 2,
                    borderRadius: 1,
                    overflowX: 'auto',
                    fontSize: 12,
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;