
import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search } from "lucide-react";
import ContactForm from "../components/contacts/ContactForm";
import ContactCard from "../components/contacts/ContactCard";
import ContactSpendingModal from "../components/contacts/ContactSpendingModal";
import FlowerOrderModal from "../components/flowers/FlowerOrderModal";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContactForSpending, setSelectedContactForSpending] = useState(null);
  const [selectedContactForFlowers, setSelectedContactForFlowers] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = contacts.filter(item =>
      Object.keys(item).some(key =>
        typeof item[key] === "string" && item[key].toLowerCase().includes(lowercasedFilter)
      )
    );
    setFilteredContacts(filteredData);
  }, [searchTerm, contacts]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const data = await Contact.list("-created_date");
      setContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingContact) {
        await Contact.update(editingContact.id, formData);
      } else {
        await Contact.create(formData);
      }
      setShowForm(false);
      setEditingContact(null);
      await loadContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert("Error saving contact. Please try again.");
    }
  };
  
  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}? This will also delete associated occasions and gifts.`)) {
      try {
        await Contact.delete(contact.id);
        await loadContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const openForm = (contact = null) => {
    setEditingContact(contact);
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const handleViewSpending = (contact) => {
    setSelectedContactForSpending(contact);
  };

  const handleBuyFlowers = (contact) => {
    setSelectedContactForFlowers(contact);
  };

  if (showForm) {
    return <ContactForm contact={editingContact} onSave={handleSave} onCancel={closeForm} onDelete={handleDelete} />;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Your Contacts
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your friends, family, and colleagues.
            </p>
          </div>
          <Button
            onClick={() => openForm()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Contact
          </Button>
        </div>

        <div className="mb-8">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Search contacts by name, relationship, etc..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 text-lg"
                />
            </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading contacts...</div>
        ) : (
            filteredContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => (
                    <ContactCard 
                        key={contact.id} 
                        contact={contact} 
                        onEdit={openForm}
                        onDelete={handleDelete}
                        onViewSpending={handleViewSpending}
                        onBuyFlowers={handleBuyFlowers}
                    />
                ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-purple-600"/>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">No contacts found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm ? "Try adjusting your search." : "Add your first contact to get started."}
                    </p>
                    {!searchTerm && (
                         <Button
                            onClick={() => openForm()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Contact
                        </Button>
                    )}
                </div>
            )
        )}
      </div>
      
      {selectedContactForSpending && (
        <ContactSpendingModal 
          contact={selectedContactForSpending}
          onClose={() => setSelectedContactForSpending(null)}
        />
      )}

      {selectedContactForFlowers && (
        <FlowerOrderModal 
          contact={selectedContactForFlowers}
          onClose={() => setSelectedContactForFlowers(null)}
        />
      )}
    </div>
  );
}
