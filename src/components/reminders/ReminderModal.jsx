import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, Gift, X, AlertCircle, RotateCcw, Trash2, Plus } from "lucide-react";

import { Gift as GiftEntity } from "@/api/entities";
import { ShoppingOption } from "@/api/entities";
import { findAndNotifyShoppingOptions } from "../gifts/shoppingUtils";
import ShoppingResults from "../gifts/ShoppingResults";
import ManualGiftEntry from "../gifts/ManualGiftEntry";

export default function ReminderModal({ occasion, contact, onClose }) {
  const [gift, setGift] = useState(null);
  const [shoppingOptions, setShoppingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    if (occasion && contact) {
      loadGiftData();
    }
  }, [occasion, contact]);

  const loadGiftData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Find or create gift entity
      let existingGifts = await GiftEntity.filter({ occasion_id: occasion.id });
      let currentGift;
      
      if (existingGifts.length > 0) {
        currentGift = existingGifts[0];
        setGift(currentGift);
        
        // Load existing shopping options
        const options = await ShoppingOption.filter({ gift_id: currentGift.id });
        setShoppingOptions(options);
        
        // If no options exist and we have a valid contact, automatically find some
        if (options.length === 0 && contact) {
          await findGiftOptions(currentGift);
        }
      } else {
        // Create new gift entity
        const preferences = contact?.preferences || {};
        let preferencesSummary = "";
        if (preferences.hobbies?.length > 0) {
          preferencesSummary += `Enjoys: ${preferences.hobbies.join(', ')}. `;
        }
        
        currentGift = await GiftEntity.create({
          occasion_id: occasion.id,
          contact_id: contact.id,
          title: `Gift ideas for ${occasion.title}`,
          category: "other",
          budget: occasion.budget || 50,
          description: preferencesSummary,
          status: 'idea'
        });
        setGift(currentGift);
        
        // Automatically find gift options for new gift
        if (contact) {
          await findGiftOptions(currentGift);
        }
      }
    } catch (error) {
      console.error("Error loading gift data:", error);
      setError("Failed to load gift data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const findGiftOptions = async (giftEntity) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const newOptions = await findAndNotifyShoppingOptions(giftEntity, contact);
      
      if (newOptions && newOptions.length > 0) {
        // Save new options to database
        const savedOptions = await Promise.all(
          newOptions.map(option => ShoppingOption.create(option))
        );
        setShoppingOptions(savedOptions);
      } else {
        setError("Couldn't find any gift suggestions. You can add options manually.");
      }
    } catch (e) {
      console.error("Error finding gift ideas:", e);
      setError("An error occurred while searching for gifts. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleReshop = async () => {
    if (!gift) return;
    
    if (window.confirm('This will remove all existing gift options and search for new ones. Continue?')) {
      try {
        // Clear existing options
        const existingOptions = shoppingOptions;
        await Promise.all(existingOptions.map(option => ShoppingOption.delete(option.id)));
        setShoppingOptions([]);
        
        // Find new options
        await findGiftOptions(gift);
      } catch (error) {
        console.error("Error reshoping:", error);
        setError("Failed to find new options.");
      }
    }
  };

  const handleDeleteGift = async () => {
    if (!gift) return;
    
    if (window.confirm('This will delete this entire gift list and all options. This cannot be undone. Continue?')) {
      try {
        // Delete all shopping options first
        const existingOptions = shoppingOptions;
        await Promise.all(existingOptions.map(option => ShoppingOption.delete(option.id)));
        
        // Delete the gift entity
        await GiftEntity.delete(gift.id);
        
        // Close the modal
        onClose();
      } catch (error) {
        console.error("Error deleting gift:", error);
        alert("Failed to delete gift. Please try again.");
      }
    }
  };

  const handleDeleteShoppingOption = async (optionId) => {
    if (window.confirm('Are you sure you want to remove this gift option?')) {
      try {
        await ShoppingOption.delete(optionId);
        const updatedOptions = await ShoppingOption.filter({ gift_id: gift.id });
        setShoppingOptions(updatedOptions);
      } catch (error) {
        console.error("Error deleting option:", error);
        alert("Failed to delete option. Please try again.");
      }
    }
  };

  const handleManualSave = async (optionData) => {
    try {
      await ShoppingOption.create(optionData);
      setShowManualEntry(false);
      const updatedOptions = await ShoppingOption.filter({ gift_id: gift.id });
      setShoppingOptions(updatedOptions);
    } catch (error) {
      console.error("Error saving manual option:", error);
      alert("Failed to save option. Please try again.");
    }
  };

  const renderContent = () => {
    if (showManualEntry && gift) {
      return (
        <ManualGiftEntry
          gift={gift}
          contact={contact}
          onSave={handleManualSave}
          onCancel={() => setShowManualEntry(false)}
        />
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-12 px-6">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Loading gift ideas...</h3>
          <p className="text-gray-500">Please wait while we prepare your gift list.</p>
        </div>
      );
    }

    if (isSearching) {
      return (
        <div className="text-center py-12 px-6">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Finding perfect gifts...</h3>
          <p className="text-gray-500">Searching stores for the best options...</p>
        </div>
      );
    }
    
    if (error && shoppingOptions.length === 0) {
      return (
        <div className="text-center py-12 px-6">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-800">No Gift Ideas Found</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => findGiftOptions(gift)} disabled={!gift}>
              Try Searching Again
            </Button>
            <Button variant="outline" onClick={() => setShowManualEntry(true)}>
              Add Manually
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Gift Ideas for {contact.name}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowManualEntry(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Option
            </Button>
            <Button variant="outline" size="sm" onClick={handleReshop} disabled={isSearching}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reshop
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteGift}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Gift List
            </Button>
          </div>
        </div>
        
        {shoppingOptions.length > 0 ? (
          <ShoppingResults
            options={shoppingOptions}
            onDeleteOption={handleDeleteShoppingOption}
            showGiftListFeatures={true}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No gift options found yet.</p>
            <p className="text-sm">Try searching again or add options manually.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl"
      >
        <Card className="w-full border-0 shadow-2xl relative max-h-[90vh] flex flex-col"> 
          <CardHeader className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl">Gift List</CardTitle>
                    <p className="text-purple-100 mt-1">For {contact.name}'s {occasion.title}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/20" 
                >
                    <X className="w-5 h-5" />
                </Button>
             </div>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto flex-1"> 
            {renderContent()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}