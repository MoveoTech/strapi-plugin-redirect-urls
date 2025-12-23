import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Box,
  Button,
  Checkbox,
  EmptyStateLayout,
  Flex,
  IconButton,
  Loader,
  TextInput,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';
import { Pencil, Plus, Trash } from '@strapi/icons';
import React, { useEffect, useState } from 'react';
import { PLUGIN_ID } from '../pluginId';

interface Redirect {
  id: number;
  from: string;
  to: string;
  type: string;
  hits: number;
}

interface RedirectListProps {
  onEdit: (redirect: Redirect) => void;
  onRefresh: () => void;
}

interface RedirectRowProps {
  redirect: Redirect;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onEdit: (redirect: Redirect) => void;
  onDelete: (id: number) => void;
}

const RedirectRow: React.FC<RedirectRowProps> = ({
  redirect,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => (
  <Tr key={redirect.id}>
    <Td>
      <Checkbox
        aria-label={`Select redirect from ${redirect.from}`}
        checked={isSelected}
        onCheckedChange={(checked: boolean) => onSelect(redirect.id, checked)}
      />
    </Td>
    <Td>
      <Typography textColor="neutral800" fontWeight="semiBold">
        {redirect.from}
      </Typography>
    </Td>
    <Td>
      <Typography textColor="neutral800">{redirect.to}</Typography>
    </Td>
    <Td>
      <Typography textColor="neutral800">{redirect.hits || 0}</Typography>
    </Td>
    <Td>
      <Flex gap={1}>
        <IconButton onClick={() => onDelete(redirect.id)} aria-label="Delete">
          <Trash />
        </IconButton>
      </Flex>
    </Td>
  </Tr>
);

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
  isDeleting: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClear,
  selectedCount,
  onBulkDelete,
  isDeleting,
}) => (
  <Flex justifyContent="space-between" alignItems="center" paddingBottom={4}>
    <Box>
      <TextInput
        name="search"
        placeholder="Search redirects..."
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        label="Search redirects"
        labelAction={
          searchTerm && (
            <Button variant="ghost" onClick={onClear} size="S">
              Clear
            </Button>
          )
        }
      />
    </Box>
    {selectedCount > 0 && (
      <Button
        variant="danger-light"
        onClick={onBulkDelete}
        loading={isDeleting}
        startIcon={<Trash />}
      >
        Delete {selectedCount} selected
      </Button>
    )}
  </Flex>
);

const useRedirectList = ({ onRefresh }: { onRefresh: () => void }) => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { get, del, post } = useFetchClient();

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const response = (await get(`/${PLUGIN_ID}/redirects`)) as { data: Redirect[] };
      setRedirects(response.data || []);
    } catch (error) {
      console.error('Error fetching redirects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this redirect?')) {
      return;
    }
    try {
      await del(`/${PLUGIN_ID}/redirects/${id}`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting redirect:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} redirects?`)) {
      return;
    }
    try {
      setIsDeleting(true);
      await post(`/${PLUGIN_ID}/redirects/bulk-delete`, { ids: selectedIds });
      setSelectedIds([]);
      onRefresh();
    } catch (error) {
      console.error('Error bulk deleting redirects:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRedirects = redirects.filter(
    (redirect) =>
      redirect.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redirect.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRedirects.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRedirect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  useEffect(() => {
    void fetchRedirects();
  }, []);

  return {
    redirects,
    loading,
    searchTerm,
    setSearchTerm,
    selectedIds,
    isDeleting,
    filteredRedirects,
    handleDelete,
    handleBulkDelete,
    handleSelectAll,
    handleSelectRedirect,
  };
};

export const RedirectList = ({ onEdit, onRefresh }: RedirectListProps) => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    selectedIds,
    isDeleting,
    filteredRedirects,
    handleDelete,
    handleBulkDelete,
    handleSelectAll,
    handleSelectRedirect,
  } = useRedirectList({ onRefresh });

  if (loading) {
    return (
      <Box padding={8}>
        <Flex justifyContent="center">
          <Loader>Loading redirects...</Loader>
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={8}>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        isDeleting={isDeleting}
      />

      {filteredRedirects.length === 0 ? (
        <EmptyStateLayout
          content="No redirects found. Create your first redirect to get started."
          action={
            <Button startIcon={<Plus />} onClick={() => onEdit({} as Redirect)}>
              Create your first redirect
            </Button>
          }
        />
      ) : (
        <Table colCount={6} rowCount={filteredRedirects.length}>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  aria-label="Select all redirects"
                  checked={
                    selectedIds.length === filteredRedirects.length && filteredRedirects.length > 0
                  }
                  indeterminate={
                    selectedIds.length > 0 && selectedIds.length < filteredRedirects.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </Th>
              <Th>
                <Typography variant="sigma">From</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">To</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Hits</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Actions</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRedirects.map((redirect) => (
              <RedirectRow
                key={redirect.id}
                redirect={redirect}
                isSelected={selectedIds.includes(redirect.id)}
                onSelect={handleSelectRedirect}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};
