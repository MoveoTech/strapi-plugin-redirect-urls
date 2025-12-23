import { useFetchClient } from '@strapi/admin/strapi-admin';
import { Box, Button, Field, Modal, TextInput, Typography } from '@strapi/design-system';
import React, { useEffect, useState } from 'react';
import { PLUGIN_ID } from '../pluginId';

type Redirect = {
  id?: number;
  from: string;
  to: string;
  type: string;
};

type RedirectModalProps = {
  redirect?: Redirect;
  onClose: () => void;
  onSave: () => void;
};

export const RedirectModal = ({ redirect, onClose, onSave }: RedirectModalProps) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    type: 'moved_permanently_301',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { post, put } = useFetchClient();

  useEffect(() => {
    if (redirect?.id) {
      setFormData({
        from: redirect.from || '',
        to: redirect.to || '',
        type: redirect.type || 'moved_permanently_301',
      });
    }
  }, [redirect]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.from.trim()) {
      newErrors.from = 'From path is required';
    } else if (!formData.from.startsWith('/')) {
      newErrors.from = 'From path must start with /';
    }

    if (formData.from === '/') {
      newErrors.from = 'From path cannot be the root path /';
    }

    if (!formData.to.trim()) {
      newErrors.to = 'To URL is required';
    }

    if (!formData.type) {
      newErrors.type = 'Redirect type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      if (redirect?.id) {
        await put(`/${PLUGIN_ID}/redirects/${redirect.id}`, formData);
      } else {
        await post(`/${PLUGIN_ID}/redirects`, formData);
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving redirect:', error);

      // Handle validation errors from server
      const errorMessage = error.response?.data?.error?.message || error.message || '';
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        setErrors({ from: 'This redirect path already exists' });
      } else {
        alert('Failed to save redirect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Modal.Root open onOpenChange={onClose}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{redirect?.id ? 'Edit Redirect' : 'Create New Redirect'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Box paddingBottom={6}>
            <Box paddingBottom={4}>
              <Field.Root id="from" name="from" error={errors.from} required>
                <Field.Label>From Path</Field.Label>
                <TextInput
                  placeholder="/old-page"
                  value={formData.from}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('from', e.target.value)
                  }
                />
                <Field.Error />
                <Field.Hint>
                  <Typography>The source path to redirect from (must start with /)</Typography>
                </Field.Hint>
              </Field.Root>
            </Box>

            <Box paddingBottom={4}>
              <Field.Root id="to" name="to" error={errors.to} required>
                <Field.Label>To URL</Field.Label>
                <TextInput
                  placeholder="https://example.com/new-page or /new-page"
                  value={formData.to}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('to', e.target.value)
                  }
                />
                <Field.Error />
                <Field.Hint>
                  <Typography>The destination URL (internal or external)</Typography>
                </Field.Hint>
              </Field.Root>
            </Box>
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} variant="tertiary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {redirect?.id ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
