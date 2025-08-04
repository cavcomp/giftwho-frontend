import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Occasion } from "@/api/entities";
import { Gift } from "@/api/entities";
import { ShoppingOption } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Calendar, Sparkles } from "lucide-react";
import { format } from 'date-fns';
import ReminderModal from "../components/reminders/ReminderModal";

export default function Occasions() {
  const [occasions, setOccasions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState(null);
  const [formData, setFormData] = useState({
    contact_id: "",
    title: "",
    type: "",
    date: "",
    budget: 50,
    recurring: true,
    reminder_days: 7,
    importance: 'medium',
    notes: ""
  });
  const [selectedOccasion, setSelectedOccasion] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [occasionsData, contactsData] = await Promise.all([
        Occasion.list("-date"),
        Contact.list()
      ]);
      console.log('Loaded occasions:', occasionsData); // Debug log
      console.log('Loaded contacts:', contactsData); // Debug log
      setOccasions(occasionsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleFormChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // Auto-generate title when contact or type changes
    if (field === 'contact_id' || field === 'type') {
      const currentContactId = field === 'contact_id' ? value : formData.contact_id;
      const currentOccasionType = field === 'type' ? value : formData.type;

      const contact = contacts.find(c => c.id === currentContactId);
      
      if (contact && currentOccasionType) {
        const firstName = contact.name.split(' ')[0];
        let formattedType = currentOccasionType;
        switch (currentOccasionType) {
            case 'birthday':
                formattedType = 'Birthday';
                break;
            case 'anniversary':
                formattedType = 'Anniversary';
                break;
            case 'holiday':
                formattedType = 'Holiday';
                break;
            case 'graduation':
                formattedType = 'Graduation';
                break;
            case 'promotion':
                formattedType = 'Promotion';
                break;
            case 'mothers_day':
                formattedType = "Mother's Day";
                break;
            case 'fathers_day':
                formattedType = "Father's Day";
                break;
            case 'quinceanera':
                formattedType = "Quinceañera";
                break;
            case 'bar_mitzvah':
                formattedType = "Bar Mitzvah";
                break;
            case 'bat_mitzvah':
                formattedType = "Bat Mitzvah";
                break;
            case 'kwanzaa':
                formattedType = "Kwanzaa";
                break;
            case 'christmas':
                formattedType = "Christmas";
                break;
            case 'hanukkah':
                formattedType = "Hanukkah";
                break;
            case 'custom':
                formattedType = 'Occasion';
                break;
            default:
                formattedType = currentOccasionType.charAt(0).toUpperCase() + currentOccasionType.slice(1).replace(/_/g, ' ');
                break;
        }

        if (currentOccasionType !== 'custom') {
            updatedFormData.title = `${firstName}'s ${formattedType}`;
        } else {
            updatedFormData.title = ""; 
        }
      } else if (currentOccasionType === 'custom' && !contact) {
          updatedFormData.title = "";
      }
    }
    
    setFormData(updatedFormData);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    console.log('Attempting to save occasion with data:', formData); // Debug log
    
    if (!formData.contact_id || !formData.title || !formData.type || !formData.date) {
      alert('Please fill in all required fields (Contact, Title, Type, and Date)');
      return;
    }

    try {
      const dataToSave = {
        contact_id: formData.contact_id,
        title: formData.title,
        type: formData.type,
        date: formData.date,
        budget: parseFloat(formData.budget) || 50,
        recurring: formData.recurring,
        reminder_days: parseInt(formData.reminder_days) || 7,
        importance: formData.importance,
        notes: formData.notes || ""
      };
      
      console.log('Data to save:', dataToSave); // Debug log
      
      let savedOccasion;
      if (editingOccasion) {
        savedOccasion = await Occasion.update(editingOccasion.id, dataToSave);
        console.log('Updated occasion:', savedOccasion); // Debug log
      } else {
        savedOccasion = await Occasion.create(dataToSave);
        console.log('Created occasion:', savedOccasion); // Debug log
      }
      
      setShowForm(false);
      setEditingOccasion(null);
      resetForm();
      await loadData(); // Reload data after saving
      
      alert('Occasion saved successfully!'); // Success confirmation
    } catch (error) {
      console.error('Error saving occasion:', error);
      alert(`Error saving occasion: ${error.message || 'Please try again.'}`);
    }
  };
  
  const resetForm = () => {
     setFormData({
        contact_id: "",
        title: "",
        type: "",
        date: "",
        budget: 50,
        recurring: true,
        reminder_days: 7,
        importance: 'medium',
        notes: ""
      });
  }

  const handleEdit = (occasion) => {
    setEditingOccasion(occasion);
    setFormData({
        contact_id: occasion.contact_id,
        title: occasion.title,
        type: occasion.type,
        date: occasion.date ? format(new Date(occasion.date), 'yyyy-MM-dd') : "",
        budget: occasion.budget || 50,
        recurring: occasion.recurring !== undefined ? occasion.recurring : true,
        reminder_days: occasion.reminder_days || 7,
        importance: occasion.importance || 'medium',
        notes: occasion.notes || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (occasion) => {
    if (window.confirm(`Delete "${occasion.title}"?`)) {
      try {
        await Occasion.delete(occasion.id);
        await loadData();
      } catch (error) {
        console.error('Error deleting occasion:', error);
        alert(`Error deleting occasion: ${error.message || 'Please try again.'}`);
      }
    }
  };
  
  const handlePlanGift = (occasion) => {
    setSelectedOccasion(occasion);
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown';
  };
  
  const getContactForOccasion = (contactId) => {
    return contacts.find((c) => c.id === contactId);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Occasions
          </h1>
          <Button onClick={() => {
            resetForm();
            setEditingOccasion(null);
            setShowForm(true);
          }} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Occasion
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{editingOccasion ? "Edit Occasion" : "Add New Occasion"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Contact *</Label>
                  <Select
                    value={formData.contact_id}
                    onValueChange={(value) => handleFormChange('contact_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map(contact => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {contacts.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      No contacts available. Please add a contact first.
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Title *</Label>
                        <Input 
                          value={formData.title} 
                          onChange={(e) => setFormData({...formData, title: e.target.value})} 
                          required 
                          placeholder="e.g., Mom's Birthday"
                        />
                    </div>
                    <div>
                        <Label>Type *</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => handleFormChange('type', value)} 
                          required
                        >
                            <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                            <SelectContent position="popper" className="max-h-72">
                                <SelectItem value="birthday">Birthday</SelectItem>
                                <SelectItem value="anniversary">Anniversary</SelectItem>
                                <SelectItem value="christmas">Christmas</SelectItem>
                                <SelectItem value="hanukkah">Hanukkah</SelectItem>
                                <SelectItem value="kwanzaa">Kwanzaa</SelectItem>
                                <SelectItem value="mothers_day">Mother's Day</SelectItem>
                                <SelectItem value="fathers_day">Father's Day</SelectItem>
                                <SelectItem value="graduation">Graduation</SelectItem>
                                <SelectItem value="promotion">Promotion</SelectItem>
                                <SelectItem value="quinceanera">Quinceañera</SelectItem>
                                <SelectItem value="bar_mitzvah">Bar Mitzvah</SelectItem>
                                <SelectItem value="bat_mitzvah">Bat Mitzvah</SelectItem>
                                <SelectItem value="holiday">Other Holiday</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Date *</Label>
                        <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required/>
                    </div>
                    <div>
                        <Label>Budget (USD)</Label>
                        <Input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})} placeholder="50"/>
                    </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit">Save Occasion</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {occasions.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No occasions yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first occasion to plan gifts for.</p>
            <Button onClick={() => {
              resetForm();
              setEditingOccasion(null);
              setShowForm(true);
            }} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Occasion
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasions.map((occasion) => (
              <Card key={occasion.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{occasion.title}</CardTitle>
                  <p className="text-sm text-gray-500 capitalize">{occasion.type}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p><span className="font-semibold">For:</span> {getContactName(occasion.contact_id)}</p>
                  <p><span className="font-semibold">Date:</span> {format(new Date(occasion.date), 'PPP')}</p>
                  {occasion.budget > 0 && <p><span className="font-semibold">Budget:</span> ${occasion.budget}</p>}
                </CardContent>
                <div className="p-4 border-t flex flex-col sm:flex-row gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handlePlanGift(occasion)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Plan Gift
                    </Button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(occasion)}>
                          <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(occasion)}>
                          <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
       {selectedOccasion && (
        <ReminderModal 
            occasion={selectedOccasion}
            contact={getContactForOccasion(selectedOccasion.contact_id)}
            onClose={() => setSelectedOccasion(null)}
        />
      )}
    </div>
  );
}