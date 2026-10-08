const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/* ==========================================
   MAIN PAGES
========================================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

/* ==========================================
   HEALTH
========================================== */

app.get("/api/health", async (req, res) => {
  res.json({
    success: true,
    application: "Abuja Life",
    server: "online",
    time: new Date().toISOString()
  });
});

/* ==========================================
   DATABASE TEST
========================================== */

app.get("/api/database-test", async (req, res) => {
  const { data, error } = await supabase
    .from("game_settings")
    .select("*")
    .limit(1);

  if (error) {
    return res.status(500).json({
      success: false,
      message: "Supabase connection reached, but the table/query failed.",
      error: error.message
    });
  }

  res.json({
    success: true,
    message: "Server successfully connected to Supabase.",
    data
  });
});

/* ==========================================
   GAME SETTINGS
========================================== */

app.get("/api/settings", async (req, res) => {
  const { data, error } = await supabase
    .from("game_settings")
    .select("*")
    .limit(1);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   LOCATIONS
========================================== */

app.get("/api/locations", async (req, res) => {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   JOBS
========================================== */

app.get("/api/jobs", async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("active", true)
    .order("salary", { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   PROPERTIES
========================================== */

app.get("/api/properties", async (req, res) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("available", true)
    .order("price");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   VEHICLES
========================================== */

app.get("/api/vehicles", async (req, res) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("price");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   BUSINESSES
========================================== */

app.get("/api/businesses", async (req, res) => {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("active", true)
    .order("purchase_price");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   MISSIONS
========================================== */

app.get("/api/missions", async (req, res) => {
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("active", true)
    .order("difficulty");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   REGISTER PLAYER
========================================== */

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      displayName
    } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Email, password and username are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    /* Check username */

    const { data: existingUsername, error: usernameError } =
      await supabase
        .from("player_profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

    if (usernameError) {
      return res.status(500).json({
        success: false,
        message: usernameError.message
      });
    }

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "That username is already taken."
      });
    }

    /* Create Supabase Auth user */

    const {
      data: authData,
      error: authError
    } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    const userId = authData.user.id;

    /* Find starting location */

    const { data: startingLocation } = await supabase
      .from("locations")
      .select("id")
      .eq("name", "Wuse")
      .maybeSingle();

    /* Create player profile */

    const { error: profileError } = await supabase
      .from("player_profiles")
      .insert({
        id: userId,
        username: cleanUsername,
        display_name: displayName || username,
        level: 1,
        xp: 0,
        reputation: 0,
        stars: 1,
        energy: 100,
        health: 100,
        hunger: 100,
        fun: 100,
        social: 100,
        hygiene: 100,
        location_id: startingLocation?.id || null
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);

      return res.status(500).json({
        success: false,
        message: "Could not create player profile.",
        error: profileError.message
      });
    }

    /* Create wallet */

    const { error: walletError } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
        balance: 1000000,
        savings_balance: 0,
        total_earned: 1000000,
        total_spent: 0
      });

    if (walletError) {
      await supabase
        .from("player_profiles")
        .delete()
        .eq("id", userId);

      await supabase.auth.admin.deleteUser(userId);

      return res.status(500).json({
        success: false,
        message: "Could not create player wallet.",
        error: walletError.message
      });
    }

    /* Record starter money */

    await supabase
      .from("transactions")
      .insert({
        receiver_id: userId,
        amount: 1000000,
        transaction_type: "STARTER_BONUS",
        description: "Abuja Life starting balance",
        status: "completed"
      });

    /* Give player missions */

    const { data: missions } = await supabase
      .from("missions")
      .select("id");

    if (missions && missions.length > 0) {
      const playerMissions = missions.map((mission) => ({
        user_id: userId,
        mission_id: mission.id,
        progress: 0,
        completed: false,
        claimed: false
      }));

      await supabase
        .from("player_missions")
        .insert(playerMissions);
    }

    res.json({
      success: true,
      message: "Welcome to Abuja Life!",
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        displayName: displayName || username
      },
      startingBalance: 1000000
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message
    });
  }
});

/* ==========================================
   LOGIN
========================================== */

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: "Login successful.",
      session: data.session,
      user: data.user
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message
    });
  }
});

/* ==========================================
   PLAYER DATA
========================================== */

app.get("/api/player/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const { data: profile, error: profileError } =
      await supabase
        .from("player_profiles")
        .select(`
          *,
          locations (
            id,
            name,
            district,
            type
          )
        `)
        .eq("id", userId)
        .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        message: "Player profile not found.",
        error: profileError.message
      });
    }

    const { data: wallet, error: walletError } =
      await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (walletError) {
      return res.status(500).json({
        success: false,
        message: "Player wallet could not be loaded.",
        error: walletError.message
      });
    }

    res.json({
      success: true,
      player: {
        profile,
        wallet
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load player.",
      error: error.message
    });
  }
});

/* ==========================================
   ADMIN PLAYERS
========================================== */

app.get("/api/admin/players", async (req, res) => {
  const { data, error } = await supabase
    .from("player_profiles")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   ADMIN TRANSACTIONS
========================================== */

app.get("/api/admin/transactions", async (req, res) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", {
      ascending: false
    })
    .limit(100);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

/* ==========================================
   404
========================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Abuja Life route not found."
  });
});

/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, () => {
  console.log(`Abuja Life server running on port ${PORT}`);
});
