import { Layouts, Page, useFetchClient, useNotification } from '@strapi/admin/strapi-admin';
import { Button, Flex } from '@strapi/design-system';
import { Trash, Plus, Upload } from '@strapi/icons';
import { useState } from 'react';
import { ImportModal } from '../components/ImportModal';
import { RedirectList } from '../components/RedirectList';
import { RedirectModal } from '../components/RedirectModal';

export const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const handleOpenModal = (redirect?: any) => {
    setEditingRedirect(redirect || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRedirect(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1);
    handleCloseModal();
  };

  const handleImportSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setIsImportModalOpen(false);
  };

  const handleClearCache = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all cache? This will affect the entire application.'
      )
    ) {
      return;
    }

    try {
      setIsClearingCache(true);
      // Use the native strapi-cache plugin endpoint
      const response = (await post('/strapi-cache/purge-cache/custom-redirects-plugin')) as {
        data: { message: string };
      };

      toggleNotification({
        type: 'success',
        message: response.data.message || 'Cache cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toggleNotification({
        type: 'danger',
        message: 'Failed to clear cache',
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <Page.Main>
      <Page.Title>Redirects</Page.Title>
      <Layouts.Header
        title="Redirects"
        subtitle="Manage URL redirects"
        primaryAction={
          <Flex gap={2}>
            <Button
              onClick={handleClearCache}
              startIcon={<Trash />}
              variant="danger"
              size="L"
              loading={isClearingCache}
            >
              Clear Cache
            </Button>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              startIcon={<Upload />}
              variant="secondary"
              size="L"
            >
              Import CSV
            </Button>
            <Button onClick={() => handleOpenModal()} startIcon={<Plus />} size="L">
              Create Redirect
            </Button>
          </Flex>
        }
      />
      <Layouts.Content>
        <RedirectList
          key={refreshKey}
          onEdit={handleOpenModal}
          onRefresh={() => setRefreshKey((prev) => prev + 1)}
        />
      </Layouts.Content>
      {isModalOpen && (
        <RedirectModal redirect={editingRedirect} onClose={handleCloseModal} onSave={handleSave} />
      )}
      {isImportModalOpen && (
        <ImportModal onClose={() => setIsImportModalOpen(false)} onSuccess={handleImportSuccess} />
      )}
    </Page.Main>
  );
};
