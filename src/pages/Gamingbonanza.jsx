import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import valorantImg from "@/assets/valorant.jpg";
import bgmiImg from "@/assets/bgmi.jpg";
import codImg from "@/assets/cod.jpg";
import mlImg from "@/assets/ml.jpg";
import freefireImg from "@/assets/freefire.jpg";
import csgoImg from "@/assets/cs-go.jpg";
import placeholderImg from "@/assets/event-placeholder.jpg";
import { supabase } from "@/lib/supabase.js";

const games = [
  { id: "bgmi", name: "BGMI", image: bgmiImg, brochure: "https://example.com/brochures/bgmi" },
  { id: "codm", name: "COD Mobile", image: codImg, brochure: "https://example.com/brochures/codm" },
  { id: "valorant", name: "Valorant", image: valorantImg, brochure: "https://example.com/brochures/valorant" },
  { id: "ml", name: "Mobile Legends", image: mlImg, brochure: "https://example.com/brochures/ml" },
  { id: "freefire", name: "Free Fire", image: freefireImg, brochure: "https://example.com/brochures/freefire" },
  { id: "csgo", name: "CS:GO", image: csgoImg, brochure: "https://example.com/brochures/csgo" },
  { id: "fifa", name: "FIFA", image: placeholderImg, brochure: "https://example.com/brochures/fifa" },
  { id: "bulletchoe", name: "Bullet Echo", image: placeholderImg, brochure: "https://example.com/brochures/bulletchoe" },
  { id: "clashroyale", name: "Clash Royale", image: placeholderImg, brochure: "https://example.com/brochures/clashroyale" },
  { id: "nfs", name: "NFS", image: placeholderImg, brochure: "https://example.com/brochures/nfs" },
];

const Gamingbonanza = () => {
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000); // hide after 3s
  };

  const handleRegisterClick = async (g) => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        // redirect to login and preserve current path
        navigate('/login', { state: { from: `/events/gamingbonanza/register/${g.id}` } });
        return;
      }
      navigate(`/events/gamingbonanza/register/${g.id}`);
    } catch (err) {
      showToast("Auth check failed");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Hero banner */}
      <div className="w-full px-4">
        <div className="mx-auto rounded-xl overflow-hidden shadow-xl max-w-[1400px]">
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2Fb08a719e7a5748bd857bfb0fe32be8a0?format=webp&width=1600"
              alt="Lock & Load banner"
              className="w-full h-72 md:h-80 lg:h-96 object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-6 py-8 text-center">
                <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-white">Gaming Bonanza</h1>
                <p className="mt-2 text-white/90 max-w-2xl mx-auto drop-shadow-md">
                  A fast-paced multi-game tournament featuring top clubs across multiple titles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games grid */}
      <div className="container mx-auto px-4 mt-8">
        <h2 className="font-orbitron text-2xl font-bold mb-6">Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <Card key={g.id} className="glass-card overflow-hidden">
              <div className="relative h-40">
                <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="font-orbitron">{g.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Prize pool: <span className="font-orbitron font-semibold">₹2,000</span>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <a href={g.brochure} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full font-orbitron mb-2">
                      View Details
                    </Button>
                  </a>
                  <Button className="w-full font-orbitron" onClick={() => handleRegisterClick(g)}>
                    Register Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-yellow-400 text-black px-5 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Gamingbonanza;
