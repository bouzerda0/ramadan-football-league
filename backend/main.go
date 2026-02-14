package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Data structures
type Player struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	TeamID string `json:"teamId"`
	Name   string `json:"name"`

	// Stats
	Goals         int `json:"goals"`
	Assists       int `json:"assists"`
	CleanSheets   int `json:"cleanSheets"`
	YellowCards   int `json:"yellowCards"`
	RedCards      int `json:"redCards"`
	MatchesPlayed int `json:"matchesPlayed"`
}

type Team struct {
	ID           string    `json:"id" gorm:"primaryKey"`
	TeamName     string    `json:"teamName"`
	CaptainName  string    `json:"captainName"`
	CaptainEmail string    `json:"captainEmail"`
	CaptainPhone string    `json:"captainPhone"`
	LogoPath     string    `json:"logoPath"`
	Players      []Player  `json:"players" gorm:"foreignKey:TeamID"`
	RegisteredAt time.Time `json:"registeredAt"`
	// Stats
	Played       int    `json:"played"`
	Won          int    `json:"won"`
	Drawn        int    `json:"drawn"`
	Lost         int    `json:"lost"`
	GoalsFor     int    `json:"goalsFor"`
	GoalsAgainst int    `json:"goalsAgainst"`
	Points       int    `json:"points"`
	Form         string `json:"form"` // e.g. "W,L,D,W,W"
}

type SiteConfig struct {
	ID                uint   `json:"-" gorm:"primaryKey"`
	Title             string `json:"title"`
	Subtitle          string `json:"subtitle"`
	HeroSubtitle      string `json:"heroSubtitle"`
	HeroTitle1        string `json:"heroTitle1"`
	HeroTitle2        string `json:"heroTitle2"`
	HeroTitle3        string `json:"heroTitle3"`
	LogoPath          string `json:"logoPath"`
	AutoUpdateMatches bool   `json:"autoUpdateMatches"`
	FeaturedMatchID   string `json:"featuredMatchId"`
	MatchStage        string `json:"matchStage"`
}

// ... existing code ...

func handleAdminTeams(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "Missing team ID", http.StatusBadRequest)
			return
		}

		log.Printf("Attempting to delete team: %s", id)

		// Start a transaction
		err := db.Transaction(func(tx *gorm.DB) error {
			// 1. Delete Players
			if err := tx.Where("team_id = ?", id).Delete(&Player{}).Error; err != nil {
				return err
			}

			// 2. Delete Team
			if err := tx.Where("id = ?", id).Delete(&Team{}).Error; err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			log.Printf("Failed to delete team %s: %v", id, err)
			http.Error(w, "Failed to delete team: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		return
	}

	// Update Team Stats
	if r.Method == http.MethodPut {
		var updatedTeam Team
		if err := json.NewDecoder(r.Body).Decode(&updatedTeam); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}

		var team Team
		if result := db.First(&team, "id = ?", updatedTeam.ID); result.Error != nil {
			http.Error(w, "Team not found", http.StatusNotFound)
			return
		}

		// Update fields
		team.Played = updatedTeam.Played
		team.Won = updatedTeam.Won
		team.Drawn = updatedTeam.Drawn
		team.Lost = updatedTeam.Lost
		team.GoalsFor = updatedTeam.GoalsFor
		team.GoalsAgainst = updatedTeam.GoalsAgainst
		team.Points = updatedTeam.Points
		team.Form = updatedTeam.Form

		db.Save(&team)
		json.NewEncoder(w).Encode(team)
		return
	}
}

func handleAdminPlayers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Update Player Stats
	if r.Method == http.MethodPut {
		var updatedPlayer Player
		if err := json.NewDecoder(r.Body).Decode(&updatedPlayer); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}

		var player Player
		if result := db.First(&player, "id = ?", updatedPlayer.ID); result.Error != nil {
			http.Error(w, "Player not found", http.StatusNotFound)
			return
		}

		// Update fields
		player.Goals = updatedPlayer.Goals
		player.Assists = updatedPlayer.Assists
		player.CleanSheets = updatedPlayer.CleanSheets
		player.YellowCards = updatedPlayer.YellowCards
		player.RedCards = updatedPlayer.RedCards
		player.MatchesPlayed = updatedPlayer.MatchesPlayed

		db.Save(&player)
		json.NewEncoder(w).Encode(player)
		return
	}
}

var (
	db         *gorm.DB
	uploadsDir = "../backend/uploads"
	dataDir    = "../backend/data"
)

func main() {
	// Ensure directories exist
	os.MkdirAll(dataDir, 0755)
	os.MkdirAll(uploadsDir, 0755)

	// Initialize Database
	var err error
	dbPath := filepath.Join(dataDir, "registrations.db")
	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	err = db.AutoMigrate(&Team{}, &Player{}, &Match{}, &SiteConfig{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed default config
	var configCount int64
	db.Model(&SiteConfig{}).Count(&configCount)
	if configCount == 0 {
		db.Create(&SiteConfig{
			Title:             "Zone 01 Oujda",
			Subtitle:          "RFL 2026",
			HeroSubtitle:      "Zone 01 Oujda • School Tournament 2026",
			HeroTitle1:        "RAMADAN",
			HeroTitle2:        "FOOTBALL",
			HeroTitle3:        "LEAGUE",
			LogoPath:          "", // Default/Empty
			AutoUpdateMatches: true,
			MatchStage:        "League Match",
		})
	}

	// Serve static files from the frontend build directory
	// Serve static files from the frontend build directory
	if _, err := os.Stat("../frontend/dist"); os.IsNotExist(err) {
		log.Println("Warning: ../frontend/dist does not exist. Please run 'npm run build' in frontend directory.")
	}

	// SPA Handler
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join("../frontend/dist", r.URL.Path)
		// Check if file exists
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			http.FileServer(http.Dir("../frontend/dist")).ServeHTTP(w, r)
			return
		}
		// Serve index.html for unknown routes (Client-side routing)
		http.ServeFile(w, r, "../frontend/dist/index.html")
	})

	// Serve uploaded files
	http.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir))))

	// Admin Middleware
	adminMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("admin_token")
			if err != nil || cookie.Value != "secret-admin-token" {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			next(w, r)
		}
	}

	// API endpoints
	http.HandleFunc("/api/status", handleStatus)
	http.HandleFunc("/api/register", handleRegister)
	http.HandleFunc("/api/teams", handleListTeams)
	http.HandleFunc("/api/matches", handleListMatches) // Public
	http.HandleFunc("/api/config", handleGetConfig)    // Public

	// Admin Endpoints
	http.HandleFunc("/api/admin/login", handleAdminLogin)
	http.Handle("/api/admin/config", adminMiddleware(http.HandlerFunc(handleAdminConfig))) // Update config
	http.Handle("/api/admin/matches", adminMiddleware(http.HandlerFunc(handleAdminMatches)))
	http.Handle("/api/admin/teams", adminMiddleware(http.HandlerFunc(handleAdminTeams)))     // For delete/update
	http.Handle("/api/admin/players", adminMiddleware(http.HandlerFunc(handleAdminPlayers))) // For delete/update

	port := "8080"
	fmt.Printf("Server starting on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

// Data structures
type Match struct {
	ID         string `json:"id" gorm:"primaryKey"`
	Matchday   int    `json:"matchday"`
	Date       string `json:"date"`
	Time       string `json:"time"`
	Venue      string `json:"venue"`
	HomeTeamID string `json:"homeTeamId"`
	AwayTeamID string `json:"awayTeamId"`
	HomeScore  int    `json:"homeScore"`
	AwayScore  int    `json:"awayScore"`
	Status     string `json:"status"`                  // scheduled, live, finished
	Round      string `json:"round"`                   // QF1, QF2, SF1, SF2, Final
	EventsJSON string `json:"events" gorm:"type:text"` // Simple JSON storage for events
}

func handleGetConfig(w http.ResponseWriter, r *http.Request) {
	var config SiteConfig
	if result := db.First(&config); result.Error != nil {
		// Should have been seeded, but fallback
		config = SiteConfig{Title: "Zone 01 Oujda", Subtitle: "RFL 2026"}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

func handleAdminConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodPut {
		// Handle multipart form for logo upload
		err := r.ParseMultipartForm(10 << 20) // 10 MB
		if err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		title := r.FormValue("title")
		subtitle := r.FormValue("subtitle")
		heroSubtitle := r.FormValue("heroSubtitle")
		heroTitle1 := r.FormValue("heroTitle1")
		heroTitle2 := r.FormValue("heroTitle2")
		heroTitle3 := r.FormValue("heroTitle3")
		autoUpdateMatches := r.FormValue("autoUpdateMatches")
		featuredMatchId := r.FormValue("featuredMatchId")
		matchStage := r.FormValue("matchStage")

		var config SiteConfig
		if result := db.First(&config); result.Error != nil {
			config = SiteConfig{} // Create new if not exists (should accept ID 1)
		}

		if title != "" {
			config.Title = title
		}
		if subtitle != "" {
			config.Subtitle = subtitle
		}
		if heroSubtitle != "" {
			config.HeroSubtitle = heroSubtitle
		}
		if heroTitle1 != "" {
			config.HeroTitle1 = heroTitle1
		}
		if heroTitle2 != "" {
			config.HeroTitle2 = heroTitle2
		}
		if heroTitle3 != "" {
			config.HeroTitle3 = heroTitle3
		}
		if autoUpdateMatches != "" {
			config.AutoUpdateMatches = autoUpdateMatches == "true"
		}
		// Always update featuredMatchId, allowing it to be empty
		config.FeaturedMatchID = featuredMatchId
		if matchStage != "" {
			config.MatchStage = matchStage
		}

		// Handle Logo Upload
		file, header, err := r.FormFile("logo")
		if err == nil {
			defer file.Close()
			filename := fmt.Sprintf("site_logo_%d_%s", time.Now().UnixNano(), header.Filename)
			dstPath := filepath.Join(uploadsDir, filename)
			dst, err := os.Create(dstPath)
			if err != nil {
				http.Error(w, "Failed to save logo", http.StatusInternalServerError)
				return
			}
			defer dst.Close()
			io.Copy(dst, file)
			config.LogoPath = "/uploads/" + filename
		}

		db.Save(&config)
		json.NewEncoder(w).Encode(config)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status": "ok", "message": "Go Backend is running with SQLite"}`)
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Extract data
	teamName := r.FormValue("teamName")
	captainName := r.FormValue("captainName")
	captainEmail := r.FormValue("captainEmail")
	captainPhone := r.FormValue("captainPhone")
	playersJSON := r.FormValue("players")

	var players []Player
	if err := json.Unmarshal([]byte(playersJSON), &players); err != nil {
		http.Error(w, "Invalid players data", http.StatusBadRequest)
		return
	}

	// Handle File Upload
	var logoPath string
	file, header, err := r.FormFile("logo")
	if err == nil {
		defer file.Close()

		// Create a unique filename
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), header.Filename)
		dstPath := filepath.Join(uploadsDir, filename)

		dst, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "Failed to save logo", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Failed to save logo", http.StatusInternalServerError)
			return
		}
		logoPath = "/uploads/" + filename
	}

	// Create Team object
	team := Team{
		ID:           fmt.Sprintf("%d", time.Now().UnixNano()),
		TeamName:     teamName,
		CaptainName:  captainName,
		CaptainEmail: captainEmail,
		CaptainPhone: captainPhone,
		LogoPath:     logoPath,
		Players:      players,
		RegisteredAt: time.Now(),
	}

	// Save to Database
	result := db.Create(&team)
	if result.Error != nil {
		log.Printf("Error saving registration: %v", result.Error)
		http.Error(w, "Failed to save registration", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful", "id": team.ID})
}

func handleListTeams(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var teams []Team
	// Preload Players to include them in the response
	result := db.Preload("Players").Find(&teams)
	if result.Error != nil {
		http.Error(w, "Failed to fetch teams", http.StatusInternalServerError)
		return
	}

	// Create a response structure to hide sensitive detaills (like Phone/Email)
	type PublicTeam struct {
		ID           string    `json:"id"`
		TeamName     string    `json:"teamName"`
		CaptainName  string    `json:"captainName"`
		LogoPath     string    `json:"logoPath"`
		Players      []Player  `json:"players"`
		RegisteredAt time.Time `json:"registeredAt"`
	}

	var publicTeams []PublicTeam
	for _, t := range teams {
		publicTeams = append(publicTeams, PublicTeam{
			ID:           t.ID,
			TeamName:     t.TeamName,
			CaptainName:  t.CaptainName,
			LogoPath:     t.LogoPath,
			Players:      t.Players,
			RegisteredAt: t.RegisteredAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(publicTeams)
}

func handleAdminLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Hardcoded credentials for simplicity
	if creds.Username == "admin" && creds.Password == "admin123" {
		http.SetCookie(w, &http.Cookie{
			Name:  "admin_token",
			Value: "secret-admin-token",
			Path:  "/",
		})
		json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
	} else {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
	}
}

func handleListMatches(w http.ResponseWriter, r *http.Request) {
	var matches []Match
	db.Find(&matches)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

func handleAdminMatches(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodPost {
		var match Match
		if err := json.NewDecoder(r.Body).Decode(&match); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}
		match.ID = fmt.Sprintf("%d", time.Now().UnixNano())
		db.Create(&match)
		json.NewEncoder(w).Encode(match)
		return
	}

	if r.Method == http.MethodPut {
		var match Match
		if err := json.NewDecoder(r.Body).Decode(&match); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}
		db.Save(&match)
		json.NewEncoder(w).Encode(match)
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "Missing match ID", http.StatusBadRequest)
			return
		}

		if err := db.Where("id = ?", id).Delete(&Match{}).Error; err != nil {
			log.Printf("Failed to delete match %s: %v", id, err)
			http.Error(w, "Failed to delete match", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		return
	}
}
