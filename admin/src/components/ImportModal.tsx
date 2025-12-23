import { useFetchClient } from '@strapi/admin/strapi-admin';
import { Alert, Box, Button, Field, Modal, Textarea, Typography } from '@strapi/design-system';
import React, { useState } from 'react';
import { PLUGIN_ID } from '../pluginId';

type ImportModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const ImportModal = ({ onClose, onSuccess }: ImportModalProps) => {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    total: number;
    skipped: Array<{ from: string; reason: string }>;
  } | null>(null);
  const [error, setError] = useState('');
  const { post } = useFetchClient();

  const handleImport = async () => {
    if (!csvData.trim()) {
      setError('Please provide CSV data');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const redirects = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (handles basic cases)
        const parts = line.split(',').map((part) => part.trim().replace(/^"|"$/g, ''));

        if (parts.length < 2) {
          throw new Error(`Invalid CSV format at line ${i + 1}. Expected: from,to`);
        }

        const [from, to] = parts;

        if (!from || !to) {
          throw new Error(`Missing data at line ${i + 1}. Both 'from' and 'to' are required`);
        }

        redirects.push({ from, to, type: 'moved_permanently_301' });
      }

      if (redirects.length === 0) {
        throw new Error('No valid redirects found in CSV data');
      }

      const response = await post(`/${PLUGIN_ID}/redirects/bulk-import`, {
        redirects,
      });
      setResult(response.data);

      if (response.data.imported === response.data.total) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error importing redirects:', error);
      setError(error.message || 'Failed to import redirects. Please check your CSV format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal.Root open onOpenChange={onClose}>
      <Modal.Content size="L">
        <Modal.Header>
          <Modal.Title>Import Redirects from CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Box paddingBottom={4}>
            <Typography variant="beta" paddingBottom={2}>
              CSV Format
            </Typography>
            <Typography variant="omega" paddingBottom={4}>
              Provide your redirects in CSV format. Each line should contain: from,to
            </Typography>

            <Box paddingBottom={4} padding={4} background="neutral100" hasRadius>
              <Typography variant="pi" fontFamily="mono">
                /old-page,/new-page{'\n'}
                /another-old-page,https://external.com{'\n'}
                /legacy-url,/modern-url
              </Typography>
            </Box>

            <Field.Root id="csvData" name="csvData">
              <Field.Label>CSV Data</Field.Label>
              <Textarea
                placeholder="Paste your CSV data here..."
                value={csvData}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCsvData(e.target.value)}
                rows={10}
              />
              <Field.Hint>
                <Typography>
                  Format: from,to (one redirect per line). All redirects will be created as 301 -
                  Moved Permanently.
                </Typography>
              </Field.Hint>
            </Field.Root>

            {error && (
              <Box paddingTop={4}>
                <Alert closeLabel="Close alert" title="Import Error" variant="danger">
                  {error}
                </Alert>
              </Box>
            )}

            {result && (
              <Box paddingTop={4}>
                <Alert
                  closeLabel="Close alert"
                  title="Import Complete"
                  variant={result.imported === result.total ? 'success' : 'warning'}
                >
                  Successfully imported {result.imported} of {result.total} redirects
                  {result.skipped.length > 0 && (
                    <Box paddingTop={2}>
                      <Typography fontWeight="bold">
                        Skipped {result.skipped.length} redirect(s):
                      </Typography>
                      {result.skipped.map((item, index) => (
                        <Typography key={index} variant="pi">
                          • {item.from} - {item.reason}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Alert>
              </Box>
            )}
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} variant="tertiary">
            Cancel
          </Button>
          <Button onClick={handleImport} loading={loading} disabled={!csvData.trim() || !!result}>
            Import Redirects
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
