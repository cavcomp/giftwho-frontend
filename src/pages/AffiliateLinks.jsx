
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { AffiliateLink } from "@/api/entities"; // Changed from "@/api/entities"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Link, Trash2, Edit, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    program_name: "",
    domain: "",
    tracking_id_param: "",
    tracking_id_value: "",
    is_active: true,
    description: ""
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
        } else {
          await loadLinks();
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = createPageUrl('Dashboard');
      }
    };
    
    checkAdminStatus();
  }, []);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const data = await AffiliateLink.list("-created_date");
      setLinks(data);
    } catch (error) {
      console.error('Error loading affiliate links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await AffiliateLink.update(editingLink.id, formData);
      } else {
        await AffiliateLink.create(formData);
      }
      setShowForm(false);
      setEditingLink(null);
      resetForm();
      loadLinks();
    } catch (error) {
      console.error('Error saving link:', error);
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData(link);
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
        try {
            await AffiliateLink.delete(id);
            loadLinks();
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    }
  };

  const resetForm = () => {
    setFormData({
      program_name: "",
      domain: "",
      tracking_id_param: "",
      tracking_id_value: "",
      is_active: true,
      description: ""
    });
  };

  const openForm = () => {
    setEditingLink(null);
    resetForm();
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    setEditingLink(null);
    resetForm();
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-lg text-gray-700">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8">Loading affiliate links...</div>;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Affiliate Links
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your custom affiliate programs.
            </p>
          </div>
          <Button
            onClick={openForm}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Link
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-8"
            >
              <Card className="max-w-3xl mx-auto shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    {editingLink ? "Edit Affiliate Link" : "Add New Affiliate Link"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="program_name">Program Name *</Label>
                        <Input id="program_name" value={formData.program_name} onChange={(e) => setFormData({...formData, program_name: e.target.value})} placeholder="e.g., Amazon Associates" required />
                      </div>
                      <div>
                        <Label htmlFor="domain">Store Domain *</Label>
                        <Input id="domain" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} placeholder="e.g., amazon.com" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tracking_id_param">Tracking Param *</Label>
                        <Input id="tracking_id_param" value={formData.tracking_id_param} onChange={(e) => setFormData({...formData, tracking_id_param: e.target.value})} placeholder="e.g., tag" required />
                      </div>
                      <div>
                        <Label htmlFor="tracking_id_value">Tracking Value *</Label>
                        <Input id="tracking_id_value" value={formData.tracking_id_value} onChange={(e) => setFormData({...formData, tracking_id_value: e.target.value})} placeholder="Your affiliate ID" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="A short description of the affiliate program" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                      <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Link
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map(link => (
                <motion.div key={link.id} initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
                    <Card className="shadow-lg border-0 overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between p-4 bg-white/50">
                            <CardTitle className="text-base font-semibold">{link.program_name}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(link)}><Edit className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleDelete(link.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 text-sm space-y-2">
                           <p><span className="font-semibold">Domain:</span> {link.domain}</p>
                           <p><span className="font-semibold">Parameter:</span> {link.tracking_id_param}</p>
                           <p><span className="font-semibold">Value:</span> {link.tracking_id_value}</p>
                           <p><span className="font-semibold">Status:</span> {link.is_active ? 'Active' : 'Inactive'}</p>
                           {link.description && <p className="text-gray-600 pt-2 border-t border-gray-100">{link.description}</p>}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
        {links.length === 0 && !showForm && (
             <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Link className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No affiliate links found</h3>
                <p className="text-gray-600 mb-6">
                    Add your first affiliate link to get started.
                </p>
             </div>
        )}
      </div>
    </div>
  );
}
