import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ImageIcon from '@mui/icons-material/Image';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import TableChartIcon from '@mui/icons-material/TableChart';

import { ExportOptions } from '../../types';
import { downloadFromDataUrl } from '../../utils/exportUtils';
import useExport from '../../hooks/useExport';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  projectId?: string;
  facilityId?: string;
  layoutId?: string;
  data?: any;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  title = 'Export',
  projectId,
  facilityId,
  layoutId,
  data,
}: ExportDialogProps) => {
  const { exportToFormat, isExporting } = useExport();
  
  const [format, setFormat] = useState<ExportOptions['format']>('pdf');
  const [quality, setQuality] = useState<ExportOptions['quality']>('high');
  const [scale, setScale] = useState<number>(1);
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [includeLabels, setIncludeLabels] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<ExportOptions['colorMode']>('color');
  const [error, setError] = useState<string | null>(null);
  
  const handleFormatChange = (event: SelectChangeEvent) => {
    setFormat(event.target.value as ExportOptions['format']);
  };
  
  const handleQualityChange = (event: SelectChangeEvent) => {
    setQuality(event.target.value as ExportOptions['quality']);
  };
  
  const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0) {
      setScale(value);
    }
  };
  
  const handleColorModeChange = (event: SelectChangeEvent) => {
    setColorMode(event.target.value as ExportOptions['colorMode']);
  };
  
  const handleExport = async () => {
    try {
      setError(null);
      
      const options: ExportOptions = {
        format,
        quality,
        scale,
        includeMetadata,
        includeLabels,
        colorMode,
      };
      
      const exportData = {
        projectId,
        facilityId,
        layoutId,
        ...data,
      };
      
      const result = await exportToFormat(exportData, options);
      
      if (result.success && result.url) {
        let filename = 'export';
        
        if (projectId) {
          filename = `project_${projectId}`;
        }
        
        if (layoutId) {
          filename = `layout_${layoutId}`;
        }
        
        let extension = '';
        switch (format) {
          case 'pdf':
            extension = '.pdf';
            break;
          case 'dxf':
          case 'dwg':
            extension = `.${format}`;
            break;
          case 'skp':
            extension = '.skp';
            break;
          case 'obj':
            extension = '.obj';
            break;
          case 'gltf':
            extension = '.gltf';
            break;
          case 'csv':
            extension = '.csv';
            break;
          case 'xlsx':
            extension = '.xlsx';
            break;
          case 'png':
            extension = '.png';
            break;
          case 'jpg':
            extension = '.jpg';
            break;
          default:
            extension = '.dat';
        }
        
        downloadFromDataUrl(result.url, `${filename}${extension}`);
        onClose();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('An unexpected error occurred during export');
    }
  };
  
  const getFormatIcon = () => {
    switch (format) {
      case 'pdf':
        return <PictureAsPdfIcon />;
      case 'dxf':
      case 'dwg':
        return <ArchitectureIcon />;
      case 'skp':
      case 'obj':
      case 'gltf':
        return <ViewInArIcon />;
      case 'csv':
      case 'xlsx':
        return <TableChartIcon />;
      case 'png':
      case 'jpg':
        return <ImageIcon />;
      default:
        return <DownloadIcon />;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Export Format
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="export-format-label">Format</InputLabel>
              <Select
                labelId="export-format-label"
                value={format}
                label="Format"
                onChange={handleFormatChange}
                startAdornment={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {getFormatIcon()}
                  </Box>
                }
              >
                <MenuItem value="pdf">PDF Document (.pdf)</MenuItem>
                <MenuItem value="dxf">CAD Drawing (.dxf)</MenuItem>
                <MenuItem value="dwg">AutoCAD Drawing (.dwg)</MenuItem>
                <MenuItem value="skp">SketchUp Model (.skp)</MenuItem>
                <MenuItem value="obj">3D Object (.obj)</MenuItem>
                <MenuItem value="gltf">GL Transmission Format (.gltf)</MenuItem>
                <MenuItem value="csv">CSV Spreadsheet (.csv)</MenuItem>
                <MenuItem value="xlsx">Excel Spreadsheet (.xlsx)</MenuItem>
                <MenuItem value="png">PNG Image (.png)</MenuItem>
                <MenuItem value="jpg">JPEG Image (.jpg)</MenuItem>
              </Select>
            </FormControl>
            
            {(format === 'png' || format === 'jpg' || format === 'pdf') && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="export-quality-label">Quality</InputLabel>
                <Select
                  labelId="export-quality-label"
                  value={quality}
                  label="Quality"
                  onChange={handleQualityChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {(format === 'dxf' || format === 'dwg' || format === 'png' || format === 'jpg') && (
              <TextField
                label="Scale"
                type="number"
                value={scale}
                onChange={handleScaleChange}
                inputProps={{ min: 0.1, step: 0.1 }}
                fullWidth
                sx={{ mb: 2 }}
              />
            )}
            
            {(format === 'png' || format === 'jpg' || format === 'pdf') && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="export-color-mode-label">Color Mode</InputLabel>
                <Select
                  labelId="export-color-mode-label"
                  value={colorMode}
                  label="Color Mode"
                  onChange={handleColorModeChange}
                >
                  <MenuItem value="color">Color</MenuItem>
                  <MenuItem value="grayscale">Grayscale</MenuItem>
                  <MenuItem value="blackAndWhite">Black & White</MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Export Options
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeMetadata}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeMetadata(e.target.checked)}
                />
              }
              label="Include metadata"
            />
            <Box sx={{ mb: 1 }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeLabels}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeLabels(e.target.checked)}
                />
              }
              label="Include labels"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Export Preview
            </Typography>
            <Box
              sx={{
                height: 200,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                {getFormatIcon()}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {format.toUpperCase()} Preview
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;