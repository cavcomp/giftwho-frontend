
import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Occasion } from "@/api/entities";
import { Gift } from "@/api/entities";
import { User } from "@/api/entities";
import { ShoppingOption } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Gift as GiftIcon,
  Heart,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  Sparkles,
  ExternalLink,
  Star,
  X,
  Search, // Added Search icon
  Link as LinkIcon,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

import StatsCard from "../components/dashboard/StatsCard";
import RecentGifts from "../components/dashboard/RecentGifts";
import { findAndNotifyShoppingOptions, findSingleCategoryOption } from "../components/gifts/shoppingUtils";
import EditLinkModal from "../components/dashboard/EditLinkModal";
import ShoppingInstructions from "../components/dashboard/ShoppingInstructions"; // Added import
import ShoppingRules from "../components/dashboard/ShoppingRules"; // Added import

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    upcomingOccasions: 0,
    totalGifts: 0,
    totalSpent: 0
  });
  const [recentGifts, setRecentGifts] = useState([]);
  const [upcomingOccasions, setUpcomingOccasions] = useState([]);
  const [occasionGifts, setOccasionGifts] = useState({});
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [processingOccasions, setProcessingOccasions] = useState(new Set());
  const [editingOption, setEditingOption] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleFindAndLink = (giftOption) => {
    // Open the search in a new tab with better search terms
    if (giftOption.search_terms) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(giftOption.search_terms + " buy online")}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
    // Open the edit modal immediately
    setEditingOption(giftOption);
  };

  const handleSaveLink = () => {
    setEditingOption(null);
    loadDashboardData(); // Refresh all data to show the updated link
  };

  const handleAddToGiftList = async (giftOption, occasion) => {
    try {
      // Update the gift option status or add to a personal gift list
      // For now, we'll just show a confirmation
      alert(`Added "${giftOption.title}" to your gift list for ${occasion.title}`);
    } catch (error) {
      console.error('Error adding to gift list:', error);
    }
  };

  const handleRemoveItem = async (giftOptionId, occasionId) => {
    if (window.confirm('Are you sure you want to remove this gift option?')) {
      try {
        await ShoppingOption.delete(giftOptionId);
        
        // Refresh the occasion gifts by filtering out the removed item
        setOccasionGifts(prev => {
          const newOccasionGifts = { ...prev };
          if (newOccasionGifts[occasionId]) { 
            newOccasionGifts[occasionId] = newOccasionGifts[occasionId].filter(opt => opt.id !== giftOptionId);
          }
          return newOccasionGifts;
        });
        alert('Gift option removed successfully!');
      } catch (error) {
        console.error('Error removing gift option:', error);
        alert('Failed to remove gift option. Please try again.');
      }
    }
  };

  const handleReshopItem = async (giftOptionId, occasionId) => {
    if (window.confirm('This will remove this item and find a new option in the same category. Continue?')) {
      try {
        const giftOptionToReplace = occasionGifts[occasionId].find(opt => opt.id === giftOptionId);
        const occasion = upcomingOccasions.find(occ => occ.id === occasionId);
        const contact = contacts.find(c => c.id === occasion?.contact_id);

        if (!giftOptionToReplace || !occasion || !contact) {
          alert('Could not reshop item due to missing data.');
          return;
        }
        
        // Immediately remove the item from the UI for better UX
        setOccasionGifts(prev => {
            const newGifts = { ...prev };
            if (newGifts[occasionId]) { // Check if the occasion has gifts before filtering
              newGifts[occasionId] = newGifts[occasionId].filter(opt => opt.id !== giftOptionId);
            }
            return newGifts;
        });

        // Delete the old option from the database
        await ShoppingOption.delete(giftOptionId);

        const existingGifts = await Gift.filter({ occasion_id: occasionId });
        if (existingGifts.length === 0) {
            alert('Could not find a base gift to reshop from.');
            return;
        }
        const currentGift = existingGifts[0];

        setProcessingOccasions(prev => new Set(prev).add(occasionId));

        try {
            const newOptions = await findSingleCategoryOption(currentGift, contact, giftOptionToReplace.category);

            if (newOptions && newOptions.length > 0) {
                const savedNewOption = await ShoppingOption.create(newOptions[0]);

                // Add the new option to the state
                setOccasionGifts(prev => {
                    const newGifts = { ...prev };
                    if (newGifts[occasionId]) {
                        newGifts[occasionId] = [...newGifts[occasionId], savedNewOption];
                    } else {
                        newGifts[occasionId] = [savedNewOption];
                    }
                    return newGifts;
                });
                alert('New gift option found and updated!');
            } else {
                alert('Could not find a new option in this category. The original item has been removed.');
            }
        } catch (error) {
            console.error(`Error finding new option for category ${giftOptionToReplace.category}:`, error);
            alert('An error occurred while trying to find a new option.');
        } finally {
            setProcessingOccasions(prev => {
                const newSet = new Set(prev);
                newSet.delete(occasionId);
                return newSet;
            });
        }
      } catch (error) {
        console.error('Error reshopping item:', error);
        alert('Failed to reshop item. Please try again.');
      }
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [contactsData, occasionsData, giftsData, userData] = await Promise.all([
        Contact.list(),
        Occasion.list("-date"),
        Gift.list("-created_date"),
        User.me()
      ]);

      setContacts(contactsData);
      setUser(userData);

      // Show ALL occasions for now
      const allOccasions = occasionsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setUpcomingOccasions(allOccasions);

      // Calculate total spent on purchased gifts
      const purchasedGifts = giftsData.filter(gift => 
        gift.status === 'purchased' || gift.status === 'delivered' || gift.status === 'given'
      );
      const totalSpent = purchasedGifts.reduce((sum, gift) => sum + (gift.price || 0), 0);

      setStats({
        totalContacts: contactsData.length,
        upcomingOccasions: allOccasions.length,
        totalGifts: giftsData.length,
        totalSpent: totalSpent
      });

      setRecentGifts(giftsData.slice(0, 5));

      // Auto-create gift lists for all occasions
      await autoCreateGiftLists(allOccasions, contactsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoCreateGiftLists = async (occasions, contactsData) => {
    const giftsByOccasion = {};
    
    for (const occasion of occasions) {
      const contact = contactsData.find(c => c.id === occasion.contact_id);
      if (!contact) continue;

      try {
        // Check if gift already exists for this occasion
        let existingGifts = await Gift.filter({ occasion_id: occasion.id });
        let currentGift;
        
        if (existingGifts.length > 0) {
          currentGift = existingGifts[0];
        } else {
          // Create new gift entity
          const preferences = contact?.preferences || {};
          let preferencesSummary = "";
          if (preferences.hobbies?.length > 0) {
            preferencesSummary += `Enjoys: ${preferences.hobbies.join(', ')}. `;
          }
          
          currentGift = await Gift.create({
            occasion_id: occasion.id,
            contact_id: contact.id,
            title: `Gift ideas for ${occasion.title}`,
            category: "other",
            budget: occasion.budget || 50,
            description: preferencesSummary,
            status: 'idea'
          });
        }

        // Load or create shopping options
        let options = await ShoppingOption.filter({ gift_id: currentGift.id });
        
        if (options.length === 0) {
          // Create gift options automatically
          setProcessingOccasions(prev => new Set(prev).add(occasion.id));
          
          try {
            const newOptions = await findAndNotifyShoppingOptions(currentGift, contact);
            
            if (newOptions && newOptions.length > 0) {
              const savedOptions = await Promise.all(
                newOptions.map(option => ShoppingOption.create(option))
              );
              options = savedOptions;
            }
          } catch (error) {
            console.error(`Error creating options for ${occasion.title}:`, error);
          }
          
          setProcessingOccasions(prev => {
            const newSet = new Set(prev);
            newSet.delete(occasion.id);
            return newSet;
          });
        }

        giftsByOccasion[occasion.id] = options;
        
      } catch (error) {
        console.error(`Error processing occasion ${occasion.title}:`, error);
      }
    }
    
    setOccasionGifts(giftsByOccasion);
  };

  const getContactForOccasion = (occasion) => {
    return contacts.find(c => c.id === occasion.contact_id);
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'electronics': return '📱';
      case 'fashion': return '👕';
      case 'home': return '🏠';
      case 'books': return '📚';
      case 'health': return '💪';
      case 'outdoors': return '🌲';
      case 'sports': return '⚽';
      case 'jewelry': return '💎';
      case 'kitchen': return '🍳';
      case 'toys': return '🧸';
      default: return '🎁';
    }
  };

  const getCategoryColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'electronics': return 'bg-blue-100 text-blue-800';
      case 'fashion': return 'bg-pink-100 text-pink-800';
      case 'home': return 'bg-green-100 text-green-800';
      case 'books': return 'bg-purple-100 text-purple-800';
      case 'health': return 'bg-orange-100 text-orange-800';
      case 'outdoors': return 'bg-lime-100 text-lime-800';
      case 'sports': return 'bg-indigo-100 text-indigo-800';
      case 'jewelry': return 'bg-rose-100 text-rose-800';
      case 'kitchen': return 'bg-amber-100 text-amber-800';
      case 'toys': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard and creating gift lists...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
       {editingOption && (
        <EditLinkModal
          option={editingOption}
          onSave={handleSaveLink}
          onCancel={() => setEditingOption(null)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your gift planning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Contacts"
            value={stats.totalContacts}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatsCard
            title="All Occasions"
            value={stats.upcomingOccasions}
            icon={Calendar}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            delay={0.1}
          />
          <StatsCard
            title="Total Gifts Planned"
            value={stats.totalGifts}
            icon={GiftIcon}
            gradient="bg-gradient-to-br from-pink-500 to-pink-600"
            delay={0.2}
          />
          <StatsCard
            title="Total Spent"
            value={`$${stats.totalSpent.toFixed(2)}`}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            delay={0.3}
          />
        </div>

        <ShoppingInstructions />
        <ShoppingRules />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentGifts gifts={recentGifts} contacts={contacts} />
          </div>

          <div>
            <Card className="shadow-lg border-0 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Occasions & Gift Ideas
                </CardTitle>
                <p className="text-xs text-gray-500">📧 Gift ideas are automatically emailed to you!</p>
              </CardHeader>
              <CardContent>
                {upcomingOccasions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No occasions found</p>
                    <p className="text-sm">Try adding an occasion first</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingOccasions.map((occasion) => {
                      const contact = getContactForOccasion(occasion);
                      const occasionDate = new Date(occasion.date);
                      const giftOptions = occasionGifts[occasion.id] || [];
                      const isProcessing = processingOccasions.has(occasion.id);
                      
                      return (
                        <div key={occasion.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{occasion.title}</h4>
                              <p className="text-sm text-gray-600 truncate">
                                For: {contact ? contact.name : 'Unknown Contact'}
                              </p>
                            </div>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                              {format(occasionDate, "MMM d, yyyy")}
                            </span>
                          </div>

                          {/* Gift Options */}
                          {isProcessing ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                              <span className="text-sm text-gray-600">Finding perfect gifts & sending email...</span>
                            </div>
                          ) : giftOptions.length > 0 ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-700">Gift Ideas by Category ({giftOptions.length})</h5>
                              </div>
                              {giftOptions.slice(0, 5).map((gift, index) => (
                                <div key={gift.id || index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h6 className="font-medium text-sm text-gray-900 mb-2">{gift.title}</h6>
                                      
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <Badge className={getCategoryColor(gift.category)}>
                                          {getCategoryIcon(gift.category)} {gift.category || 'General'}
                                        </Badge>
                                        {!gift.needs_manual_link && gift.store_name && (
                                          <Badge variant="outline" className="text-xs border-green-300 text-green-800 bg-green-50">
                                            <Check className="w-3 h-3 mr-1" />
                                            {gift.store_name}
                                          </Badge>
                                        )}
                                        {gift.rating && (
                                          <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs">{gift.rating}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {gift.needs_manual_link && (
                                        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                          <p className="text-xs text-amber-800">
                                            💡 AI Suggestion: Click "Find & Link" to add a product URL.
                                          </p>
                                        </div>
                                      )}

                                      {gift.target_interest && (
                                        <div className="mb-2">
                                          <Badge className="text-xs bg-blue-100 text-blue-800">
                                            💡 Matches their interest in: {gift.target_interest}
                                          </Badge>
                                        </div>
                                      )}
                                      
                                      <p className="text-xs text-gray-600 mb-3">{gift.description}</p>
                                    </div>
                                    
                                    <div className="text-right ml-3">
                                      <span className="text-lg font-bold text-green-700">
                                        {!gift.needs_manual_link && gift.current_price ? `$${gift.current_price?.toFixed(2)}` : '...'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 flex-wrap">
                                    <Button
                                      size="sm"
                                      onClick={() => handleFindAndLink(gift)}
                                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs"
                                    >
                                      <LinkIcon className="w-3 h-3 mr-1" />
                                      Find & Link Product
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddToGiftList(gift, occasion)}
                                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add to Gift List
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReshopItem(gift.id, occasion.id)}
                                      className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                                    >
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      Reshop
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRemoveItem(gift.id, occasion.id)}
                                      className="text-xs border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <GiftIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No gift ideas found</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to={createPageUrl("Contacts")}>
                  <Button className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <Users className="w-5 h-5 mr-2" />
                    Add New Contact
                  </Button>
                </Link>
                <Link to={createPageUrl("Occasions")}>
                  <Button className="w-full h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    <Calendar className="w-5 h-5 mr-2" />
                    Plan Occasion
                  </Button>
                </Link>
                <Link to={createPageUrl("Gifts")}>
                  <Button className="w-full h-16 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                    <GiftIcon className="w-5 h-5 mr-2" />
                    Browse Gifts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
