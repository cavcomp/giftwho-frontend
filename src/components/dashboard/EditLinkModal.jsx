import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShoppingOption } from '@/api/entities';

export default function EditLinkModal({ option, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    store_url: '',
    store_name: '',
    current_price: option.current_price || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.store_url || !formData.store_name || !formData.current_price) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await ShoppingOption.update(option.id, {
        ...formData,
        current_price: parseFloat(formData.current_price),
        needs_manual_link: false, // We've now linked it!
      });
      onSave(); // This will close the modal and refresh the dashboard data
    } catch (err) {
      console.error('Failed to save link:', err);
      setError('Could not save link. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Add Product Link</CardTitle>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 pt-1">
              After finding the product online, paste the details below.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="store_url">Product URL *</Label>
                <Input
                  id="store_url"
                  type="url"
                  value={formData.store_url}
                  onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                  placeholder="https://www.store.com/product-page"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_name">Store Name *</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    placeholder="e.g., Amazon, Walmart"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="current_price">Price *</Label>
                  <Input
                    id="current_price"
                    type="number"
                    step="0.01"
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    placeholder="49.99"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Link</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}