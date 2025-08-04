import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function ManualGiftEntry({ gift, contact, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    store_name: "",
    store_url: "",
    image_url: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const optionData = {
      ...formData,
      current_price: parseFloat(formData.price) || 0,
      gift_id: gift.id
    };
    onSave(optionData);
  };

  return (
    <Card className="shadow-lg border-0 max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Gift Option Manually
        </CardTitle>
        <p className="text-purple-100">
          Add a specific gift you found for {contact.name}
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., JBL Clip 4 Portable Bluetooth Speaker"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Why this gift is perfect for them..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="49.99"
                required
              />
            </div>
            <div>
              <Label htmlFor="store_name">Store Name *</Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                placeholder="e.g., Amazon, Target, etc."
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="store_url">Product URL</Label>
            <Input
              id="store_url"
              type="url"
              value={formData.store_url}
              onChange={(e) => setFormData({...formData, store_url: e.target.value})}
              placeholder="https://www.amazon.com/dp/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Copy and paste the direct link to the product page
            </p>
          </div>

          <div>
            <Label htmlFor="image_url">Product Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Right-click on the product image and copy image address
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Save className="w-4 h-4 mr-2" />
              Add Gift Option
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}