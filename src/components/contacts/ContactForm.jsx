
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Save, Camera, Trash2, Calendar, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@/api/entities";

export default function ContactForm({ contact, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState(contact || {
    name: "",
    email: "",
    relationship: "",
    gender: "",
    birthday: "",
    occasions: [],
    preferences: {
      favorite_colors: [],
      hobbies: [],
      style: "",
      sizes: {
        clothing: "",
        shoes: "",
        pants: "",
        hats: "",
        rings: "",
        gloves: "",
        bras: "",
        panty: "", // Added panty size field
        jewelry: ""
      }
    },
    notes: "",
    avatar_url: ""
  });

  const [newColor, setNewColor] = useState("");
  const [newHobby, setNewHobby] = useState("");
  const [showOccasionForm, setShowOccasionForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newOccasion, setNewOccasion] = useState({
    type: "",
    title: "",
    date: "",
    budget: "",
    recurring: true,
    reminder_days: 7,
    importance: "medium",
    notes: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };


  const addColor = () => {
    if (newColor.trim()) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          favorite_colors: [...(prev.preferences.favorite_colors || []), newColor.trim()]
        }
      }));
      setNewColor("");
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        favorite_colors: prev.preferences.favorite_colors.filter(color => color !== colorToRemove)
      }
    }));
  };

  const addHobby = () => {
    if (newHobby.trim()) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          hobbies: [...(prev.preferences.hobbies || []), newHobby.trim()]
        }
      }));
      setNewHobby("");
    }
  };

  const removeHobby = (hobbyToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        hobbies: prev.preferences.hobbies.filter(hobby => hobby !== hobbyToRemove)
      }
    }));
  };

  const addOccasion = () => {
    if (newOccasion.type && newOccasion.title && newOccasion.date && newOccasion.budget) {
      const occasionToAdd = {
        ...newOccasion,
        budget: parseFloat(newOccasion.budget)
      };
      
      setFormData(prev => ({
        ...prev,
        occasions: [...(prev.occasions || []), occasionToAdd]
      }));
      
      setNewOccasion({
        type: "",
        title: "",
        date: "",
        budget: "",
        recurring: true,
        reminder_days: 7,
        importance: "medium",
        notes: ""
      });
      setShowOccasionForm(false);
    }
  };

  const removeOccasion = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      occasions: prev.occasions.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleOccasionChange = (field, value) => {
    setNewOccasion(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate title based on contact name and occasion type
      if ((field === 'type') && formData.name && updated.type) {
        const typeName = updated.type.charAt(0).toUpperCase() + updated.type.slice(1).replace(/_/g, ' '); // Replace underscores for display
        updated.title = `${formData.name}'s ${typeName}`;
      }
      
      return updated;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {contact ? "Edit Contact" : "Add New Contact"}
            {isProcessing && (
              <div className="flex items-center gap-2 ml-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData({...formData, relationship: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="girlfriend">Girlfriend</SelectItem>
                    <SelectItem value="boyfriend">Boyfriend</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birthday">Birthday *</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Used for age-appropriate gift suggestions</p>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gift Preferences</h3>
                <p className="text-sm text-gray-500">Help us find the perfect gifts based on their tastes</p>
              </div>
              
              <div>
                <Label>Favorite Colors</Label>
                <p className="text-sm text-gray-500 mb-2">Enter a color and click the + button to add it</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Enter a color (e.g., blue, red, purple)"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addColor();
                      }
                    }}
                  />
                  <Button type="button" onClick={addColor} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preferences.favorite_colors?.map((color, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.preferences.favorite_colors?.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No colors added yet</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Hobbies & Interests</Label>
                <p className="text-sm text-gray-500 mb-2">Enter a hobby or interest and click the + button to add it</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    placeholder="Enter a hobby (e.g., reading, cooking, gaming)"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHobby();
                      }
                    }}
                  />
                  <Button type="button" onClick={addHobby} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preferences.hobbies?.map((hobby, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {hobby}
                      <button
                        type="button"
                        onClick={() => removeHobby(hobby)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.preferences.hobbies?.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No hobbies added yet</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="style">Style Preference</Label>
                <Select
                  value={formData.preferences.style}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    preferences: {...formData.preferences, style: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="trendy">Trendy</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="bohemian">Bohemian</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="clothing">Clothing Size</Label>
                  <Select
                    value={formData.preferences.sizes.clothing}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, clothing: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XXS">XXS</SelectItem>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                      <SelectItem value="XXXL">XXXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pants">Pants Size</Label>
                  <Select
                    value={formData.preferences.sizes.pants}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, pants: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="26">26</SelectItem>
                      <SelectItem value="27">27</SelectItem>
                      <SelectItem value="28">28</SelectItem>
                      <SelectItem value="29">29</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="31">31</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="33">33</SelectItem>
                      <SelectItem value="34">34</SelectItem>
                      <SelectItem value="35">35</SelectItem>
                      <SelectItem value="36">36</SelectItem>
                      <SelectItem value="38">38</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="42">42</SelectItem>
                      <SelectItem value="44">44</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bras">Bra Size</Label>
                  <Select
                    value={formData.preferences.sizes.bras}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, bras: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30A">30A</SelectItem>
                      <SelectItem value="30B">30B</SelectItem>
                      <SelectItem value="30C">30C</SelectItem>
                      <SelectItem value="30D">30D</SelectItem>
                      <SelectItem value="32A">32A</SelectItem>
                      <SelectItem value="32B">32B</SelectItem>
                      <SelectItem value="32C">32C</SelectItem>
                      <SelectItem value="32D">32D</SelectItem>
                      <SelectItem value="32DD">32DD</SelectItem>
                      <SelectItem value="34A">34A</SelectItem>
                      <SelectItem value="34B">34B</SelectItem>
                      <SelectItem value="34C">34C</SelectItem>
                      <SelectItem value="34D">34D</SelectItem>
                      <SelectItem value="34DD">34DD</SelectItem>
                      <SelectItem value="36A">36A</SelectItem>
                      <SelectItem value="36B">36B</SelectItem>
                      <SelectItem value="36C">36C</SelectItem>
                      <SelectItem value="36D">36D</SelectItem>
                      <SelectItem value="36DD">36DD</SelectItem>
                      <SelectItem value="38A">38A</SelectItem>
                      <SelectItem value="38B">38B</SelectItem>
                      <SelectItem value="38C">38C</SelectItem>
                      <SelectItem value="38D">38D</SelectItem>
                      <SelectItem value="38DD">38DD</SelectItem>
                      <SelectItem value="40A">40A</SelectItem>
                      <SelectItem value="40B">40B</SelectItem>
                      <SelectItem value="40C">40C</SelectItem>
                      <SelectItem value="40D">40D</SelectItem>
                      <SelectItem value="40DD">40DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="panty">Panty Size</Label>
                  <Select
                    value={formData.preferences.sizes.panty}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, panty: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XXS">XXS</SelectItem>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                      <SelectItem value="XXXL">XXXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="shoes">Shoe Size</Label>
                  <Select
                    value={formData.preferences.sizes.shoes}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, shoes: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="5.5">5.5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="6.5">6.5</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="7.5">7.5</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="8.5">8.5</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="9.5">9.5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="10.5">10.5</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="11.5">11.5</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="13">13</SelectItem>
                      <SelectItem value="14">14</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hats">Hat Size</Label>
                  <Select
                    value={formData.preferences.sizes.hats}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, hats: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS (6 3/4)">XS (6 3/4)</SelectItem>
                      <SelectItem value="S (6 7/8 - 7)">S (6 7/8 - 7)</SelectItem>
                      <SelectItem value="M (7 1/8 - 7 1/4)">M (7 1/8 - 7 1/4)</SelectItem>
                      <SelectItem value="L (7 3/8 - 7 1/2)">L (7 3/8 - 7 1/2)</SelectItem>
                      <SelectItem value="XL (7 5/8 - 7 3/4)">XL (7 5/8 - 7 3/4)</SelectItem>
                      <SelectItem value="XXL (7 7/8 - 8)">XXL (7 7/8 - 8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rings">Ring Size</Label>
                  <Select
                    value={formData.preferences.sizes.rings}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, rings: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="3.5">3.5</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="4.5">4.5</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="5.5">5.5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="6.5">6.5</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="7.5">7.5</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="8.5">8.5</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="9.5">9.5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="10.5">10.5</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="11.5">11.5</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gloves">Glove Size</Label>
                  <Select
                    value={formData.preferences.sizes.gloves}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        sizes: {...formData.preferences.sizes, gloves: value}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="6.5">6.5</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="7.5">7.5</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="8.5">8.5</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="9.5">9.5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="jewelry">Other Jewelry</Label>
                <Input
                  id="jewelry"
                  value={formData.preferences.sizes.jewelry}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      sizes: {...formData.preferences.sizes, jewelry: e.target.value}
                    }
                  })}
                  placeholder="Bracelet, necklace sizes"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional notes about gift preferences, allergies, or special considerations..."
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center gap-3 pt-4">
               <div>
                {contact && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(contact)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Contact
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
