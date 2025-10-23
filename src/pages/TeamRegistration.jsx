import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase.js";
import { gameConfig, getGameConfig } from "@/data/gameConfig.js";

const TeamRegistration = () => {
  const { eventId, gameId } = useParams();
  const navigate = useNavigate();
  const gameInfo = getGameConfig(gameId);

  const [loading, setLoading] = useState(false);
  const [collegeType, setCollegeType] = useState("nits");
  const [formData, setFormData] = useState({
    email: "",
    teamName: "",
    teamLeaderName: "",
    teamLeaderContact: "",
    alternateContact: "",
    players: [],
    playerInGameNames: [],
    scholarIds: [],
  });

  // Check if email is NITS student
  const isNitsEmail = (email) => {
    const nitsEmailPattern = /^[a-zA-Z0-9_]+_ug_\d{2}@[a-zA-Z0-9]+\.nits\.ac\.in$/;
    return nitsEmailPattern.test(email);
  };

  useEffect(() => {
    const initializeForm = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.email) {
        const userEmail = sessionData.session.user.email;
        setFormData((prev) => ({ ...prev, email: userEmail }));
        // Auto-set college type based on email
        if (!isNitsEmail(userEmail)) {
          setCollegeType("other");
        } else {
          setCollegeType("nits");
        }
      }
    };
    initializeForm();
  }, []);

  if (!gameInfo) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Game not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/events")}>Back to Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const playerCount = gameInfo.playerCount;
  const price = collegeType === "nits" ? gameInfo.price.nits : gameInfo.price.other;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlayerChange = (index, field, value) => {
    const newData = { ...formData };
    if (field === "name") {
      newData.players[index] = value;
    } else if (field === "inGameName") {
      newData.playerInGameNames[index] = value;
    } else if (field === "scholarId") {
      newData.scholarIds[index] = value;
    }
    setFormData(newData);
  };

  const validateForm = () => {
    if (!formData.email) return "Email is required";
    if (!formData.teamName) return "Team name is required";
    if (!formData.teamLeaderName) return "Team leader name is required";
    if (!formData.teamLeaderContact) return "Team leader contact is required";
    if (!formData.alternateContact) return "Alternate contact is required";
    if (!formData.playerInGameNames[0]) return "Team leader in-game name is required";
    if (collegeType === "nits" && !formData.scholarIds[0]) {
      return "Team leader scholar ID is required for NITS students";
    }

    // Validate remaining players (starting from Player 2)
    for (let i = 1; i < playerCount; i++) {
      if (!formData.players[i]) return `Player ${i + 1} name is required`;
      if (!formData.playerInGameNames[i]) return `Player ${i + 1} in-game name is required`;
      if (collegeType === "nits" && !formData.scholarIds[i]) {
        return `Player ${i + 1} scholar ID is required for NITS students`;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      return toast.error(error);
    }

    setLoading(true);

    try {
      // Set Player 1 as team leader
      const allPlayers = [formData.teamLeaderName, ...formData.players.slice(1)];

      const registrationData = {
        event_id: eventId,
        game_id: gameId,
        email: formData.email,
        team_name: formData.teamName,
        team_leader_name: formData.teamLeaderName,
        team_leader_contact: formData.teamLeaderContact,
        alternate_contact: formData.alternateContact,
        college_type: collegeType,
        players: allPlayers,
        player_in_game_names: formData.playerInGameNames,
        scholar_ids: collegeType === "nits" ? formData.scholarIds : [],
        amount: price,
        payment_status: "pending",
        created_at: new Date().toISOString(),
      };

      // Save registration to database
      const { data: savedData, error: dbError } = await supabase
        .from("team_registrations")
        .insert([registrationData])
        .select();

      if (dbError) {
        toast.error(dbError.message);
        setLoading(false);
        return;
      }

      const registrationId = savedData?.[0]?.id;

      // Update payment status to completed (in production, verify with Razorpay server)
      const { error: updateError } = await supabase
        .from("team_registrations")
        .update({ payment_status: "completed" })
        .eq("id", registrationId);

      if (updateError) {
        toast.error("Failed to update payment status");
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_placeholder",
          amount: price * 100,
          currency: "INR",
          name: `${gameInfo.name} Registration`,
          description: `Team: ${formData.teamName}`,
          receipt: `reg_${registrationId}`,
          handler: async (response) => {
            try {
              // In production, verify payment signature here with backend
              navigate(`/registration-confirmation/${registrationId}`, {
                state: { teamName: formData.teamName, gameName: gameInfo.name },
              });
            } catch (err) {
              toast.error("Payment error");
              console.error(err);
            }
          },
          prefill: {
            email: formData.email,
            contact: formData.teamLeaderContact,
          },
          theme: {
            color: "#000000",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.message || "Registration failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="font-orbitron text-3xl">{gameInfo.name} Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label>Email ID *</Label>
                <Input required type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="your@email.com" />
              </div>

              <div>
                <Label>Team Name *</Label>
                <Input required value={formData.teamName} onChange={(e) => handleInputChange("teamName", e.target.value)} placeholder="Enter team name" />
              </div>

              <div>
                <Label>Team Leader / Player 1 Name *</Label>
                <Input required value={formData.teamLeaderName} onChange={(e) => handleInputChange("teamLeaderName", e.target.value)} placeholder="Leader name" />
              </div>

              <div>
                <Label>Team Leader In-Game Name ({gameInfo.name} #Tagline) *</Label>
                <Input required value={formData.playerInGameNames[0] || ""} onChange={(e) => handlePlayerChange(0, "inGameName", e.target.value)} placeholder="In-game name with tagline" />
              </div>

              <div>
                <Label>Team Leader Contact (WhatsApp) *</Label>
                <Input required value={formData.teamLeaderContact} onChange={(e) => handleInputChange("teamLeaderContact", e.target.value)} placeholder="10-digit number" />
              </div>

              <div>
                <Label>Alternate Contact (WhatsApp) *</Label>
                <Input required value={formData.alternateContact} onChange={(e) => handleInputChange("alternateContact", e.target.value)} placeholder="10-digit number" />
              </div>

              {collegeType === "nits" && (
                <div>
                  <Label>Team Leader Scholar ID *</Label>
                  <Input required value={formData.scholarIds[0] || ""} onChange={(e) => handlePlayerChange(0, "scholarId", e.target.value)} placeholder="Scholar ID" />
                </div>
              )}
            </div>

            {/* College Type */}
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg font-semibold">College Type</h3>
              <Select value={collegeType} onValueChange={setCollegeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nits">NITS Student (₹{gameInfo.price.nits})</SelectItem>
                  <SelectItem value="other">Other College (₹{gameInfo.price.other})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Players Info - Starting from Player 2 */}
            {playerCount > 1 && (
              <div className="space-y-4">
                <h3 className="font-orbitron text-lg font-semibold">Additional Players</h3>
                {Array.from({ length: playerCount - 1 }).map((_, i) => {
                  const playerIndex = i + 1;
                  return (
                    <div key={playerIndex} className="border border-border/30 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm">Player {playerIndex + 1}</h4>

                      <div>
                        <Label className="text-xs">Player {playerIndex + 1} Name *</Label>
                        <Input
                          required
                          value={formData.players[playerIndex] || ""}
                          onChange={(e) => handlePlayerChange(playerIndex, "name", e.target.value)}
                          placeholder="Player name"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">In-Game Name ({gameInfo.name} #Tagline) *</Label>
                        <Input
                          required
                          value={formData.playerInGameNames[playerIndex] || ""}
                          onChange={(e) => handlePlayerChange(playerIndex, "inGameName", e.target.value)}
                          placeholder="In-game name with tagline"
                        />
                      </div>

                      {collegeType === "nits" && (
                        <div>
                          <Label className="text-xs">Scholar ID *</Label>
                          <Input
                            required
                            value={formData.scholarIds[playerIndex] || ""}
                            onChange={(e) => handlePlayerChange(playerIndex, "scholarId", e.target.value)}
                            placeholder="Scholar ID"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Price and Submit */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total Amount:</span>
                <span className="font-orbitron text-2xl font-bold text-primary">₹{price}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/events")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 font-orbitron"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Pay ₹${price}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamRegistration;
