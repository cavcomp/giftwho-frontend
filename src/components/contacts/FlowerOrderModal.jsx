import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Flower2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FlowerOrderModal({ contact, onClose }) {
  const flowerServiceUrl = `https://www.1800flowers.com/`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Flower2 className="w-6 h-6 text-pink-500" />
                <CardTitle>Buy Flowers for {contact.name}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 pt-1">
              Redirecting to one of our partners to complete your flower order.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              Click the button below to browse flower arrangements and place an order.
            </p>
            <Button
              onClick={() => window.open(flowerServiceUrl, '_blank', 'noopener,noreferrer')}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to 1-800-Flowers.com
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              This will open in a new tab. You can close this window anytime.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}