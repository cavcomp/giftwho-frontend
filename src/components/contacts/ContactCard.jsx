
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Gift,
  Pencil,
  Trash2,
  Cake,
  Heart,
  Briefcase,
  DollarSign,
  Flower2
} from "lucide-react";
import { format } from "date-fns";

export default function ContactCard({ contact, onEdit, onViewGifts, onDelete, onViewSpending, onBuyFlowers }) {
  const getAvatarFallback = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRelationshipIcon = (relationship) => {
    switch(relationship) {
      case 'family': return <Heart className="w-4 h-4"/>;
      case 'friend': return <User className="w-4 h-4"/>;
      case 'colleague': return <Briefcase className="w-4 h-4"/>;
      case 'partner': return <Heart className="w-4 h-4"/>;
      case 'girlfriend': return <Heart className="w-4 h-4"/>;
      case 'boyfriend': return <Heart className="w-4 h-4"/>;
      default: return <User className="w-4 h-4"/>;
    }
  };

  return (
    <Card className="shadow-lg border-0 h-full flex flex-col hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-b border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            {getAvatarFallback(contact.name)}
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">{contact.name}</CardTitle>
            <Badge variant="outline" className="mt-1 capitalize flex items-center gap-1">
              {getRelationshipIcon(contact.relationship)}
              {contact.relationship}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1">
        <div className="space-y-4">
          {contact.birthday && (
            <div className="flex items-center gap-3 text-gray-600">
              <Cake className="w-5 h-5 text-pink-500" />
              <span>{format(new Date(contact.birthday), "MMMM do, yyyy")}</span>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-sm mb-2 text-gray-800">Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {contact.preferences?.hobbies?.length > 0 ? (
                contact.preferences.hobbies.map(hobby => (
                  <Badge key={hobby} variant="secondary">{hobby}</Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No hobbies listed.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
               {contact.preferences?.favorite_colors?.length > 0 ? (
                contact.preferences.favorite_colors.map(color => (
                  <Badge key={color} variant="outline" style={{ borderColor: color, color: color }}>{color}</Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No favorite colors listed.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-4 bg-gray-50/50 border-t flex flex-col gap-2">
        <Button
          size="sm"
          onClick={() => onBuyFlowers(contact)}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
        >
          <Flower2 className="w-4 h-4 mr-2" />
          Buy Flowers
        </Button>
        <Button
          size="sm"
          onClick={() => onViewSpending(contact)}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          View Spending
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onEdit(contact)}
            className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            variant="outline"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => onDelete(contact)}
            className="flex-1"
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
