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

// Player represents a player in the database
type Player struct {
	ID           string `json:"id" gorm:"primaryKey"`
	TeamID       string `json:"teamId"`
	Name         string `json:"name"`
	Number       int    `json:"number"`
	Position     string `json:"position"` // GK, DEF, MID, FWD
	IsCaptain    bool   `json:"isCaptain"`
	IsSubstitute bool   `json:"isSubstitute"`

	// Stats
	Goals         int `json:"goals"`
	Assists       int `json:"assists"`
	CleanSheets   int `json:"cleanSheets"`
	YellowCards   int `json:"yellowCards"`
	RedCards      int `json:"redCards"`
	MatchesPlayed int `json:"matchesPlayed"`
}

// Team represents a team in the database
type Team struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	Name           string    `json:"name"`
	ShortName      string    `json:"shortName"`
	LogoPath       string    `json:"logoPath"`
	Cohort         string    `json:"cohort"`
	Captain        string    `json:"captain"`
	CaptainEmail   string    `json:"captainEmail"`
	CaptainPhone   string    `json:"captainPhone"`
	Motto          string    `json:"motto"`
	PrimaryColor   string    `json:"primaryColor"`
	SecondaryColor string    `json:"secondaryColor"`
	QRCode         string    `json:"qrCode"`
	Players        []Player  `json:"squad" gorm:"foreignKey:TeamID"`
	RegisteredAt   time.Time `json:"registeredAt"`

	// Stats
	Played         int      `json:"played"`
	Won            int      `json:"won"`
	Drawn          int      `json:"drawn"`
	Lost           int      `json:"lost"`
	GoalsFor       int      `json:"goalsFor"`
	GoalsAgainst   int      `json:"goalsAgainst"`
	GoalDifference int      `json:"goalDifference"`
	Points         int      `json:"points"`
	FormString     string   `json:"-" gorm:"column:form"`
	Form           []string `json:"form" gorm:"-"`
	RamadanSpirit  int      `json:"ramadanSpirit"`
}

// AfterFind hook for Team to split FormString
func (t *Team) AfterFind(tx *gorm.DB) (err error) {
	if t.FormString != "" {
		// Simple split by comma, if format is "W,L,D"
		// If empty, leave as nil or empty slice
		// For now simple implementation:
		// We need to implement proper parsing if it's complex,
		// but main.go comment said "W,L,D,W,W"
		t.Form = make([]string, 0)
		current := ""
		for _, c := range t.FormString {
			if c == ',' {
				t.Form = append(t.Form, current)
				current = ""
			} else {
				current += string(c)
			}
		}
		if current != "" {
			t.Form = append(t.Form, current)
		}
	} else {
		t.Form = []string{}
	}
	return
}

// BeforeSave hook to join Form
func (t *Team) BeforeSave(tx *gorm.DB) (err error) {
	if len(t.Form) > 0 {
		// Join with comma
		result := ""
		for i, f := range t.Form {
			if i > 0 {
				result += ","
			}
			result += f
		}
		t.FormString = result
	}
	return
}

// Match represents a match in the database
type Match struct {
	ID         string       `json:"id" gorm:"primaryKey"`
	Matchday   int          `json:"matchday"`
	Date       string       `json:"date"`
	Time       string       `json:"time"`
	Venue      string       `json:"venue"`
	HomeTeamID string       `json:"homeTeamId"`
	AwayTeamID string       `json:"awayTeamId"`
	HomeScore  int          `json:"homeScore"`
	AwayScore  int          `json:"awayScore"`
	Status     string       `json:"status"` // scheduled, live, finished, postponed
	Round      string       `json:"round"`  // QF1, QF2, SF1, SF2, Final
	MVP        string       `json:"mvp"`
	EventsJSON string       `json:"-" gorm:"column:events_json;type:text"`
	Events     []MatchEvent `json:"events" gorm:"-"`
}

// AfterFind hook for Match
func (m *Match) AfterFind(tx *gorm.DB) (err error) {
	if m.EventsJSON != "" {
		return json.Unmarshal([]byte(m.EventsJSON), &m.Events)
	}
	m.Events = []MatchEvent{}
	return
}

// BeforeSave hook for Match
func (m *Match) BeforeSave(tx *gorm.DB) (err error) {
	if m.Events != nil {
		bytes, err := json.Marshal(m.Events)
		if err != nil {
			return err
		}
		m.EventsJSON = string(bytes)
	}
	return
}

// MatchEvent represents an event in a match
type MatchEvent struct {
	ID             string `json:"id"`
	Minute         int    `json:"minute"`
	Type           string `json:"type"` // goal, ownGoal, yellowCard, redCard, substitution
	PlayerID       string `json:"playerId"`
	TeamID         string `json:"teamId"`
	AssistPlayerID string `json:"assistPlayerId,omitempty"`
	Description    string `json:"description"`
}

// SiteConfig represents the website configuration
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

	// Prayer Times
	Fajr    string `json:"fajr"`
	Sunrise string `json:"sunrise"`
	Dhuhr   string `json:"dhuhr"`
	Asr     string `json:"asr"`
	Maghrib string `json:"maghrib"`
	Isha    string `json:"isha"`

	// Weather
	WeatherTemp      int    `json:"weatherTemp"`
	WeatherCondition string `json:"weatherCondition"`
	WeatherWind      int    `json:"weatherWind"`
	WeatherHumidity  int    `json:"weatherHumidity"`
}

var (
	db         *gorm.DB
	uploadsDir = "./uploads"
	dataDir    = "./data"
)

func main() {
	// Ensure directories exist
	os.MkdirAll(dataDir, 0755)
	os.MkdirAll(uploadsDir, 0755)

	// Initialize Database
	var err error
	dbPath := filepath.Join(dataDir, "league.db")
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
			LogoPath:          "",
			AutoUpdateMatches: true,
			MatchStage:        "League Match",
			Fajr:              "05:42",
			Sunrise:           "07:02",
			Dhuhr:             "13:15",
			Asr:               "16:42",
			Maghrib:           "19:08",
			Isha:              "20:28",
			WeatherTemp:       18,
			WeatherCondition:  "Clear",
			WeatherWind:       12,
			WeatherHumidity:   62,
		})
	}

	// Determine frontend dist path
	distPath := "./frontend/dist"
	if _, err := os.Stat(distPath); os.IsNotExist(err) {
		// Try parent directory
		if _, err := os.Stat("../frontend/dist"); err == nil {
			distPath = "../frontend/dist"
		} else {
			log.Println("Warning: frontend/dist not found in . or ..")
		}
	}

	// SPA Handler
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(distPath, r.URL.Path)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			http.FileServer(http.Dir(distPath)).ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(distPath, "index.html"))
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

	// Public API endpoints
	http.HandleFunc("/api/status", handleStatus)
	http.HandleFunc("/api/register", handleRegister)
	http.HandleFunc("/api/teams", handleListTeams)
	http.HandleFunc("/api/matches", handleListMatches)
	http.HandleFunc("/api/config", handleGetConfig)

	// Admin Endpoints
	http.HandleFunc("/api/admin/login", handleAdminLogin)
	http.Handle("/api/admin/config", adminMiddleware(http.HandlerFunc(handleAdminConfig)))
	http.Handle("/api/admin/matches", adminMiddleware(http.HandlerFunc(handleAdminMatches)))
	http.Handle("/api/admin/teams", adminMiddleware(http.HandlerFunc(handleAdminTeams)))
	http.Handle("/api/admin/players", adminMiddleware(http.HandlerFunc(handleAdminPlayers)))

	port := "8080"
	fmt.Printf("Server starting on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

// Public Handlers

func handleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "message": "Go Backend is running"})
}

func handleGetConfig(w http.ResponseWriter, r *http.Request) {
	var config SiteConfig
	if result := db.First(&config); result.Error != nil {
		config = SiteConfig{Title: "Zone 01 Oujda", Subtitle: "RFL 2026"}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

func handleListTeams(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var teams []Team
	result := db.Preload("Players").Find(&teams)
	if result.Error != nil {
		http.Error(w, "Failed to fetch teams", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

func handleListMatches(w http.ResponseWriter, r *http.Request) {
	var matches []Match
	db.Find(&matches)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

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

	var logoPath string
	file, header, err := r.FormFile("logo")
	if err == nil {
		defer file.Close()
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

	team := Team{
		ID:             fmt.Sprintf("team%d", time.Now().UnixNano()),
		Name:           teamName,
		ShortName:      generateShortName(teamName),
		Captain:        captainName,
		CaptainEmail:   captainEmail,
		CaptainPhone:   captainPhone,
		LogoPath:       logoPath,
		Players:        players,
		RegisteredAt:   time.Now(),
		Motto:          "",
		PrimaryColor:   "#D4A018",
		SecondaryColor: "#0B0F1C",
		QRCode:         "",
	}

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

// Admin Handlers

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

func handleAdminConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		var config SiteConfig
		if result := db.First(&config); result.Error != nil {
			config = SiteConfig{Title: "Zone 01 Oujda", Subtitle: "RFL 2026"}
		}
		json.NewEncoder(w).Encode(config)
		return
	}

	if r.Method == http.MethodPut {
		var config SiteConfig
		if result := db.First(&config); result.Error != nil {
			config = SiteConfig{}
		}

		contentType := r.Header.Get("Content-Type")
		isMultipart := len(contentType) > 0 && (contentType == "multipart/form-data" || len(contentType) > 19 && contentType[:19] == "multipart/form-data")

		if isMultipart {
			// Handle multipart form (logo upload)
			err := r.ParseMultipartForm(10 << 20)
			if err != nil {
				http.Error(w, "Failed to parse request", http.StatusBadRequest)
				return
			}

			if title := r.FormValue("title"); title != "" {
				config.Title = title
			}
			if subtitle := r.FormValue("subtitle"); subtitle != "" {
				config.Subtitle = subtitle
			}
			if heroSubtitle := r.FormValue("heroSubtitle"); heroSubtitle != "" {
				config.HeroSubtitle = heroSubtitle
			}
			if heroTitle1 := r.FormValue("heroTitle1"); heroTitle1 != "" {
				config.HeroTitle1 = heroTitle1
			}
			if heroTitle2 := r.FormValue("heroTitle2"); heroTitle2 != "" {
				config.HeroTitle2 = heroTitle2
			}
			if heroTitle3 := r.FormValue("heroTitle3"); heroTitle3 != "" {
				config.HeroTitle3 = heroTitle3
			}
			if matchStage := r.FormValue("matchStage"); matchStage != "" {
				config.MatchStage = matchStage
			}
			if featuredMatchId := r.FormValue("featuredMatchId"); featuredMatchId != "" {
				config.FeaturedMatchID = featuredMatchId
			}
			if autoUpdate := r.FormValue("autoUpdateMatches"); autoUpdate != "" {
				config.AutoUpdateMatches = autoUpdate == "true"
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
				log.Printf("Logo uploaded: %s", config.LogoPath)
			}
		} else {
			// Handle JSON updates
			var updates map[string]interface{}
			if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
				http.Error(w, "Invalid JSON", http.StatusBadRequest)
				return
			}
			if title, ok := updates["title"].(string); ok {
				config.Title = title
			}
			if subtitle, ok := updates["subtitle"].(string); ok {
				config.Subtitle = subtitle
			}
			if heroSubtitle, ok := updates["heroSubtitle"].(string); ok {
				config.HeroSubtitle = heroSubtitle
			}
			if heroTitle1, ok := updates["heroTitle1"].(string); ok {
				config.HeroTitle1 = heroTitle1
			}
			if heroTitle2, ok := updates["heroTitle2"].(string); ok {
				config.HeroTitle2 = heroTitle2
			}
			if heroTitle3, ok := updates["heroTitle3"].(string); ok {
				config.HeroTitle3 = heroTitle3
			}
			if matchStage, ok := updates["matchStage"].(string); ok {
				config.MatchStage = matchStage
			}
			if featuredMatchId, ok := updates["featuredMatchId"].(string); ok {
				config.FeaturedMatchID = featuredMatchId
			}
			if autoUpdate, ok := updates["autoUpdateMatches"].(bool); ok {
				config.AutoUpdateMatches = autoUpdate
			}
			// Only update logoPath if a non-empty value is provided
			if logoPath, ok := updates["logoPath"].(string); ok && logoPath != "" {
				config.LogoPath = logoPath
			}
		}

		if result := db.Save(&config); result.Error != nil {
			log.Printf("Error saving config: %v", result.Error)
		}
		json.NewEncoder(w).Encode(config)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func handleAdminTeams(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		var teams []Team
		if err := db.Preload("Players").Find(&teams).Error; err != nil {
			http.Error(w, "Failed to fetch teams", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(teams)
		return

	case http.MethodPost:
		// Create new team from admin
		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			// Try JSON
			var team Team
			if err := json.NewDecoder(r.Body).Decode(&team); err != nil {
				http.Error(w, "Invalid data", http.StatusBadRequest)
				return
			}
			team.ID = fmt.Sprintf("team%d", time.Now().UnixNano())
			team.RegisteredAt = time.Now()
			if team.ShortName == "" {
				team.ShortName = generateShortName(team.Name)
			}
			for i := range team.Players {
				if team.Players[i].ID == "" {
					team.Players[i].ID = fmt.Sprintf("p%d", time.Now().UnixNano()+int64(i))
				}
				team.Players[i].TeamID = team.ID
			}
			if err := db.Create(&team).Error; err != nil {
				http.Error(w, "Failed to create team", http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(team)
			return
		}

		// Handle multipart form
		team := Team{
			ID:             fmt.Sprintf("team%d", time.Now().UnixNano()),
			Name:           r.FormValue("name"),
			ShortName:      r.FormValue("shortName"),
			Cohort:         r.FormValue("cohort"),
			Captain:        r.FormValue("captain"),
			CaptainEmail:   r.FormValue("captainEmail"),
			CaptainPhone:   r.FormValue("captainPhone"),
			Motto:          r.FormValue("motto"),
			PrimaryColor:   r.FormValue("primaryColor"),
			SecondaryColor: r.FormValue("secondaryColor"),
			QRCode:         r.FormValue("qrCode"),
			RegisteredAt:   time.Now(),
		}

		if team.ShortName == "" {
			team.ShortName = generateShortName(team.Name)
		}
		if team.PrimaryColor == "" {
			team.PrimaryColor = "#D4A018"
		}
		if team.SecondaryColor == "" {
			team.SecondaryColor = "#0B0F1C"
		}

		// Handle logo upload
		file, header, err := r.FormFile("logo")
		if err == nil {
			defer file.Close()
			filename := fmt.Sprintf("team_logo_%d_%s", time.Now().UnixNano(), header.Filename)
			dstPath := filepath.Join(uploadsDir, filename)
			dst, err := os.Create(dstPath)
			if err != nil {
				http.Error(w, "Failed to save logo", http.StatusInternalServerError)
				return
			}
			defer dst.Close()
			io.Copy(dst, file)
			team.LogoPath = "/uploads/" + filename
		}

		// Parse players JSON
		playersJSON := r.FormValue("players")
		if playersJSON != "" {
			var players []Player
			if err := json.Unmarshal([]byte(playersJSON), &players); err == nil {
				for i := range players {
					if players[i].ID == "" {
						players[i].ID = fmt.Sprintf("p%d", time.Now().UnixNano()+int64(i))
					}
					players[i].TeamID = team.ID
				}
				team.Players = players
			}
		}

		if err := db.Create(&team).Error; err != nil {
			http.Error(w, "Failed to create team", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(team)
		return

	case http.MethodPut:
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
		team.Name = updatedTeam.Name
		team.ShortName = updatedTeam.ShortName
		team.Cohort = updatedTeam.Cohort
		team.Captain = updatedTeam.Captain
		team.CaptainEmail = updatedTeam.CaptainEmail
		team.CaptainPhone = updatedTeam.CaptainPhone
		team.Motto = updatedTeam.Motto
		team.PrimaryColor = updatedTeam.PrimaryColor
		team.SecondaryColor = updatedTeam.SecondaryColor
		team.QRCode = updatedTeam.QRCode
		team.LogoPath = updatedTeam.LogoPath
		team.Played = updatedTeam.Played
		team.Won = updatedTeam.Won
		team.Drawn = updatedTeam.Drawn
		team.Lost = updatedTeam.Lost
		team.GoalsFor = updatedTeam.GoalsFor
		team.GoalsAgainst = updatedTeam.GoalsAgainst
		team.GoalDifference = updatedTeam.GoalDifference
		team.Points = updatedTeam.Points
		team.Points = updatedTeam.Points
		team.Form = updatedTeam.Form
		team.RamadanSpirit = updatedTeam.RamadanSpirit
		team.RamadanSpirit = updatedTeam.RamadanSpirit

		// Update players
		if len(updatedTeam.Players) > 0 {
			// Delete existing players
			db.Where("team_id = ?", team.ID).Delete(&Player{})
			// Create new players
			for i := range updatedTeam.Players {
				if updatedTeam.Players[i].ID == "" {
					updatedTeam.Players[i].ID = fmt.Sprintf("p%d", time.Now().UnixNano()+int64(i))
				}
				updatedTeam.Players[i].TeamID = team.ID
				db.Create(&updatedTeam.Players[i])
			}
			team.Players = updatedTeam.Players
		}

		db.Save(&team)
		json.NewEncoder(w).Encode(team)
		return

	case http.MethodDelete:
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "Missing team ID", http.StatusBadRequest)
			return
		}

		err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Where("team_id = ?", id).Delete(&Player{}).Error; err != nil {
				return err
			}
			if err := tx.Where("id = ?", id).Delete(&Team{}).Error; err != nil {
				return err
			}
			return nil
		})

		if err != nil {
			log.Printf("Failed to delete team %s: %v", id, err)
			http.Error(w, "Failed to delete team", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func handleAdminPlayers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		teamId := r.URL.Query().Get("teamId")
		var players []Player
		query := db
		if teamId != "" {
			query = query.Where("team_id = ?", teamId)
		}
		if err := query.Find(&players).Error; err != nil {
			http.Error(w, "Failed to fetch players", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(players)
		return

	case http.MethodPost:
		var player Player
		if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}
		player.ID = fmt.Sprintf("p%d", time.Now().UnixNano())
		if err := db.Create(&player).Error; err != nil {
			http.Error(w, "Failed to create player", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(player)
		return

	case http.MethodPut:
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

		player.Name = updatedPlayer.Name
		player.Number = updatedPlayer.Number
		player.Position = updatedPlayer.Position
		player.IsCaptain = updatedPlayer.IsCaptain
		player.IsSubstitute = updatedPlayer.IsSubstitute
		player.Goals = updatedPlayer.Goals
		player.Assists = updatedPlayer.Assists
		player.CleanSheets = updatedPlayer.CleanSheets
		player.YellowCards = updatedPlayer.YellowCards
		player.RedCards = updatedPlayer.RedCards
		player.MatchesPlayed = updatedPlayer.MatchesPlayed

		db.Save(&player)
		json.NewEncoder(w).Encode(player)
		return

	case http.MethodDelete:
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "Missing player ID", http.StatusBadRequest)
			return
		}

		if err := db.Where("id = ?", id).Delete(&Player{}).Error; err != nil {
			http.Error(w, "Failed to delete player", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func handleAdminMatches(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		var matches []Match
		db.Find(&matches)
		json.NewEncoder(w).Encode(matches)
		return

	case http.MethodPost:
		var match Match
		if err := json.NewDecoder(r.Body).Decode(&match); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}
		match.ID = fmt.Sprintf("m%d", time.Now().UnixNano())
		db.Create(&match)
		json.NewEncoder(w).Encode(match)
		return

	case http.MethodPut:
		var match Match
		if err := json.NewDecoder(r.Body).Decode(&match); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}
		db.Save(&match)
		json.NewEncoder(w).Encode(match)
		return

	case http.MethodDelete:
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

// Helper functions

func generateShortName(name string) string {
	if len(name) <= 3 {
		return name
	}
	words := []rune(name)
	var result []rune
	for i, r := range words {
		if i == 0 || (i > 0 && words[i-1] == ' ') {
			result = append(result, r)
		}
		if len(result) >= 3 {
			break
		}
	}
	return string(result)
}
