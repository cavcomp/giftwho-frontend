
import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Occasion } from "@/api/entities";
import { Gift } from "@/api/entities";
import { ShoppingOption } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Gift as GiftIcon, DollarSign, ChevronDown, ChevronUp, AlertTriangle, ExternalLink, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ShoppingButton from "../components/gifts/ShoppingButton";
import ShoppingResults from "../components/gifts/ShoppingResults";
import ManualGiftEntry from "../components/gifts/ManualGiftEntry";

export default function Gifts() {
  const [gifts, setGifts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [shoppingOptions, setShoppingOptions] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [expandedGift, setExpandedGift] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForBulkPurchase, setSelectedForBulkPurchase] = useState(new Set());
  const [manualEntryGift, setManualEntryGift] = useState(null);

  const [formData, setFormData] = useState({
    contact_id: "",
    occasion_id: "",
    title: "",
    category: "",
    budget: "",
    description: "",
    status: "idea",
    store_url: "",
    price: "",
    vendor: "",
    purchase_date: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [giftsData, contactsData, occasionsData, optionsData] = await Promise.all([
        Gift.list("-created_date"),
        Contact.list(),
        Occasion.list(),
        ShoppingOption.list()
      ]);
      setGifts(giftsData);
      setContacts(contactsData);
      setOccasions(occasionsData);
      
      const optionsByGift = optionsData.reduce((acc, option) => {
        if (!acc[option.gift_id]) {
          acc[option.gift_id] = [];
        }
        acc[option.gift_id].push(option);
        return acc;
      }, {});
      setShoppingOptions(optionsByGift);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGift = async (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      price: parseFloat(formData.price) || 0,
    };
    
    try {
      if (editingGift) {
        await Gift.update(editingGift.id, dataToSave);
      } else {
        await Gift.create(dataToSave);
      }
      setShowForm(false);
      setEditingGift(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving gift:', error);
    }
  };
  
  const handleDeleteGift = async (gift) => {
    if (window.confirm(`Delete "${gift.title}"? This will also delete all associated gift options.`)) {
        try {
            await Gift.delete(gift.id);
            await loadData();
        } catch(e) {
            console.error(e)
        }
    }
  }

  const handleEditGift = (gift) => {
    setEditingGift(gift);
    setFormData({
      ...gift,
      budget: gift.budget?.toString() || "",
      price: gift.price?.toString() || "",
      purchase_date: gift.purchase_date ? new Date(gift.purchase_date).toISOString().split('T')[0] : ""
    });
    setShowForm(true);
  };
  
  const resetForm = () => {
     setFormData({
        contact_id: "",
        occasion_id: "",
        title: "",
        category: "other",
        budget: "50",
        description: "",
        status: "idea",
        store_url: "",
        price: "",
        vendor: "",
        purchase_date: ""
    });
  }

  const handleDeleteShoppingOption = async (optionId) => {
    if (window.confirm('Are you sure you want to remove this gift option?')) {
      try {
        await ShoppingOption.delete(optionId);
        await loadData();
      } catch (error) {
        console.error('Error deleting shopping option:', error);
      }
    }
  };

  const handleAddGiftOption = (gift) => {
    setManualEntryGift(gift);
  };

  const handleReshop = async (gift) => {
    if (window.confirm('This will clear all existing gift options for this list. Are you sure you want to continue?')) {
      try {
        const existingOptions = shoppingOptions[gift.id] || [];
        await Promise.all(existingOptions.map(option => ShoppingOption.delete(option.id)));
        await loadData();
      } catch (error) {
        console.error('Error clearing options:', error);
        alert('Error clearing existing options. Please try again.');
      }
    }
  };

  const handleManualGiftSave = async (optionData) => {
    try {
      await ShoppingOption.create(optionData);
      setManualEntryGift(null);
      await loadData();
    } catch (error) {
      console.error("Error saving manual gift option:", error);
      alert("Error saving gift option. Please try again.");
    }
  };

  const handleOptionsAdded = () => {
    loadData(); // Refresh the data when new options are added via AI
  };

  const handleBulkPurchase = () => {
    const selectedOptions = [];
    
    Object.values(shoppingOptions).flat().forEach(option => {
      if (selectedForBulkPurchase.has(option.id)) {
        selectedOptions.push(option);
      }
    });

    if (selectedOptions.length === 0) {
      alert('Please select at least one item to purchase.');
      return;
    }

    selectedOptions.forEach((option, index) => {
      setTimeout(() => {
        window.open(option.store_url, '_blank');
      }, index * 200);
    });

    setSelectedForBulkPurchase(new Set());
    alert(`Opening ${selectedOptions.length} item(s) in new tabs.`);
  };

  const toggleOptionSelection = (optionId) => {
    const newSelection = new Set(selectedForBulkPurchase);
    if (newSelection.has(optionId)) {
      newSelection.delete(optionId);
    } else {
      newSelection.add(optionId);
    }
    setSelectedForBulkPurchase(newSelection);
  };

  const getContactName = (contactId) => contacts.find(c => c.id === contactId)?.name || '...';
  const getContact = (contactId) => contacts.find(c => c.id === contactId);
  const getOccasionTitle = (occasionId) => occasions.find(o => o.id === occasionId)?.title || null;

  const purchasableOptions = Object.values(shoppingOptions).flat();

  if (isLoading) {
    return <div className="p-8">Loading gifts...</div>;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gift Planner
          </h1>
          <div className="flex gap-3">
            {purchasableOptions.length > 0 && (
              <Button 
                onClick={handleBulkPurchase}
                disabled={selectedForBulkPurchase.size === 0}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Selected ({selectedForBulkPurchase.size})
              </Button>
            )}
            <Button onClick={() => { resetForm(); setEditingGift(null); setShowForm(true); }} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Gift Idea
            </Button>
          </div>
        </div>

        {purchasableOptions.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Smart Bulk Purchase:</strong> Check items you want to buy, then click "Buy Selected" to open each product page.
            </p>
          </div>
        )}

        {showForm && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
            <Card className="mb-8 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>{editingGift ? "Edit Gift Idea" : "Add Gift Idea"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGift} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Contact *</Label>
                      <Select value={formData.contact_id} onValueChange={(v) => setFormData({...formData, contact_id: v})} required>
                        <SelectTrigger><SelectValue placeholder="Select contact"/></SelectTrigger>
                        <SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Occasion</Label>
                      <Select value={formData.occasion_id} onValueChange={(v) => setFormData({...formData, occasion_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select occasion (optional)"/></SelectTrigger>
                        <SelectContent>{occasions.filter(o => o.contact_id === formData.contact_id).map(o => <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Gift Title *</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="e.g., A good book" />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label>Category *</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="jewelry">Jewelry</SelectItem>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="electronics">Electronics</SelectItem>
                                <SelectItem value="books">Books</SelectItem>
                                <SelectItem value="home">Home</SelectItem>
                                <SelectItem value="beauty">Beauty</SelectItem>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="art">Art</SelectItem>
                                <SelectItem value="food">Food</SelectItem>
                                <SelectItem value="experiences">Experiences</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <div>
                        <Label>Status *</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="idea">Idea</SelectItem>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="purchased">Purchased</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="given">Given</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Budget</Label>
                            <Input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="$50.00"/>
                        </div>
                        <div>
                           <Label>Actual Price</Label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="$45.99"/>
                        </div>
                   </div>
                   <div>
                       <Label>Description/Notes</Label>
                       <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Any notes about this gift idea..."/>
                   </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit">Save Gift</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-4">
          {gifts.map((gift) => {
            const giftContact = getContact(gift.contact_id);
            const giftOptions = shoppingOptions[gift.id] || [];
            
            return (
            <Card key={gift.id} className="shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                      <p className="text-xl font-bold text-gray-800">{getContactName(gift.contact_id)}</p>
                      <p className="text-md text-gray-500">{getOccasionTitle(gift.occasion_id) || `Gift Idea: ${gift.title}`}</p>
                  </div>
                  <div className="text-center">
                      <p className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{giftOptions.length}</p>
                      <p className="text-sm font-medium text-gray-500">Items in List</p>
                  </div>
                  <Button onClick={() => setExpandedGift(expandedGift === gift.id ? null : gift.id)} className="w-32">
                      {expandedGift === gift.id ? 'Hide List' : 'See List'}
                      {expandedGift === gift.id ? <ChevronUp className="w-4 h-4 ml-2"/> : <ChevronDown className="w-4 h-4 ml-2"/>}
                  </Button>
                </div>
              </div>
              
              <AnimatePresence>
                {expandedGift === gift.id && (
                    <motion.div initial={{opacity:0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="border-t">
                        <CardContent className="p-6">
                            {giftContact ? (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                    <ShoppingButton
                                      gift={gift}
                                      contact={giftContact}
                                      onAddOption={handleAddGiftOption}
                                      onReshop={handleReshop}
                                      hasExistingResults={giftOptions.length > 0}
                                      onOptionsAdded={handleOptionsAdded}
                                    />
                                    
                                    {giftOptions.length > 0 && (
                                      <p className="text-sm text-green-700 font-medium">{giftOptions.length} items found</p>
                                    )}
                                </div>
                                
                                {giftOptions.length > 0 ? (
                                    <ShoppingResults 
                                      options={giftOptions} 
                                      onDeleteOption={handleDeleteShoppingOption}
                                      onToggleSelection={toggleOptionSelection}
                                      selectedOptions={selectedForBulkPurchase}
                                      showGiftListFeatures={true}
                                    />
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <GiftIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No items in this gift list yet.</p>
                                        <p className="text-sm">Click "Get Suggestions" for AI recommendations or "Add Gift Option" to add items manually.</p>
                                    </div>
                                )}
                              </>
                            ) : (
                              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-4">
                                <AlertTriangle className="w-8 h-8 flex-shrink-0"/>
                                <div>
                                  <h5 className="font-bold">Contact Missing</h5>
                                  <p className="text-sm">This gift's assigned contact may have been deleted. Please edit the gift to re-assign a contact.</p>
                                </div>
                              </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                           <Button variant="outline" size="sm" onClick={() => handleEditGift(gift)}><Edit className="w-4 h-4 mr-2"/> Edit Gift Idea</Button>
                           <Button variant="destructive" size="sm" onClick={() => handleDeleteGift(gift)}><Trash2 className="w-4 h-4 mr-2"/> Delete Gift Idea</Button>
                        </CardFooter>
                    </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )})}
        </div>

        {manualEntryGift && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <ManualGiftEntry
              gift={manualEntryGift}
              contact={getContact(manualEntryGift.contact_id)}
              onSave={handleManualGiftSave}
              onCancel={() => setManualEntryGift(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
