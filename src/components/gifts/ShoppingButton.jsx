
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, RotateCcw, Loader2 } from "lucide-react";
import { findAndNotifyShoppingOptions } from "./shoppingUtils";
import { ShoppingOption } from "@/api/entities";
import { User } from "@/api/entities";

export default function ShoppingButton({ gift, contact, onAddOption, onReshop, hasExistingResults = false, onOptionsAdded }) {
  const [isSearching, setIsSearching] = useState(false);

  if (!contact) {
    return (
      <div className="text-sm text-red-600 font-medium p-2 bg-red-50 border border-red-200 rounded-md">
        ⚠️ Contact missing! Please edit this gift and assign a contact.
      </div>
    );
  }

  const handleGetSuggestions = async () => {
    setIsSearching(true);
    try {
      const user = await User.me();
      const options = await findAndNotifyShoppingOptions(gift, contact, user.email);
      
      if (options && options.length > 0) {
        // Save all options to database
        const savedOptions = await Promise.all(
          options.map(option => ShoppingOption.create(option))
        );
        
        if (onOptionsAdded) {
          onOptionsAdded();
        }
      } else {
        alert('No gift suggestions found. Please try adjusting the budget or gift description.');
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      alert('Error getting suggestions. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onAddOption(gift)}
        size="sm"
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Gift Option
      </Button>
      
      <Button
        onClick={handleGetSuggestions}
        disabled={isSearching}
        size="sm"
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
      >
        {isSearching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Edit className="w-4 h-4 mr-2" />
            Get Suggestions
          </>
        )}
      </Button>
      
      {hasExistingResults && (
        <Button
          onClick={() => onReshop(gift)}
          size="sm"
          variant="outline"
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear and Reshop
        </Button>
      )}
    </div>
  );
}
