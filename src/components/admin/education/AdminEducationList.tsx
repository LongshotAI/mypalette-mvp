
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import { getReadableDate } from '@/lib/utils';
import { toast } from 'sonner';
import AdminFormModal from '@/components/admin/shared/AdminFormModal';
import EducationResourceForm, { ResourceFormValues } from './EducationResourceForm';
import { 
  createEducationResource, 
  updateEducationResource, 
  deleteEducationResource 
} from '@/services/api/education.api';

export interface EducationResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  author: string;
  external_url?: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

interface AdminEducationListProps {
  resources: EducationResource[];
  loading: boolean;
  onRefetch: () => Promise<void>;
}

const AdminEducationList = ({ 
  resources, 
  loading, 
  onRefetch 
}: AdminEducationListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EducationResource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<EducationResource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateResource = () => {
    setIsCreating(true);
  };

  const handleEditResource = (resource: EducationResource) => {
    setSelectedResource(resource);
    setIsEditing(true);
  };

  const handleDeleteResource = (resource: EducationResource) => {
    setResourceToDelete(resource);
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await deleteEducationResource(resourceToDelete.id);
      
      if (response.status === 'success') {
        toast.success('Resource deleted successfully');
        onRefetch();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    } finally {
      setIsDeleting(false);
      setResourceToDelete(null);
    }
  };

  const handleFormSubmit = async (values: ResourceFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedResource) {
        // Update existing resource
        const response = await updateEducationResource(selectedResource.id, values);
        
        if (response.status === 'success') {
          toast.success('Resource updated successfully');
          onRefetch();
          setIsEditing(false);
          setSelectedResource(null);
        } else {
          throw new Error(response.message);
        }
      } else {
        // Create new resource
        const response = await createEducationResource(values);
        
        if (response.status === 'success') {
          toast.success('Resource created successfully');
          onRefetch();
          setIsCreating(false);
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const searchLower = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(searchLower) ||
      resource.author.toLowerCase().includes(searchLower) ||
      resource.category.toLowerCase().includes(searchLower) ||
      resource.description.toLowerCase().includes(searchLower)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Article</Badge>;
      case 'video':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Video</Badge>;
      case 'guide':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Guide</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={handleCreateResource}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>
      
      {filteredResources.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No resources found</p>
          {searchQuery && (
            <Button 
              variant="ghost" 
              className="mt-2" 
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium truncate max-w-[200px]">
                    {resource.title}
                  </TableCell>
                  <TableCell>{getTypeIcon(resource.type)}</TableCell>
                  <TableCell>{resource.category}</TableCell>
                  <TableCell>{resource.author}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${resource.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {resource.is_published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell>{getReadableDate(resource.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditResource(resource)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {resource.external_url && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => window.open(resource.external_url, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteResource(resource)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Resource Modal */}
      <AdminFormModal
        title="Add New Resource"
        description="Create a new educational resource for users."
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={() => {}}
        isSubmitting={isSubmitting}
        submitLabel=""
      >
        <EducationResourceForm
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </AdminFormModal>

      {/* Edit Resource Modal */}
      <AdminFormModal
        title="Edit Resource"
        description="Update this educational resource."
        isOpen={isEditing && !!selectedResource}
        onClose={() => {
          setIsEditing(false);
          setSelectedResource(null);
        }}
        onSubmit={() => {}}
        isSubmitting={isSubmitting}
        submitLabel=""
      >
        {selectedResource && (
          <EducationResourceForm
            defaultValues={{
              title: selectedResource.title,
              description: selectedResource.description,
              type: selectedResource.type,
              category: selectedResource.category,
              author: selectedResource.author,
              external_url: selectedResource.external_url || '',
              image_url: selectedResource.image_url || '',
              is_published: selectedResource.is_published
            }}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </AdminFormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => {
        if (!open) setResourceToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the resource "{resourceToDelete?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteResource}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEducationList;
