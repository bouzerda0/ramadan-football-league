package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"ramadan-league/internal/database"
	"ramadan-league/internal/models"
	"ramadan-league/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Response helpers
func success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    data,
	})
}

func errorResponse(c *gin.Context, status int, message string) {
	c.JSON(status, models.APIResponse{
		Success: false,
		Error:   message,
	})
}

// ============ Public Handlers ============

// GetStatus returns API status
func GetStatus(c *gin.Context) {
	success(c, gin.H{
		"status":  "ok",
		"message": "Ramadan Football League API is running",
		"version": "2.0.0",
	})
}

// GetConfig returns site configuration
func GetConfig(c *gin.Context) {
	db := database.GetDB()
	var config models.SiteConfig
	if err := db.First(&config).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch config")
		return
	}
	log.Printf("ℹ️ [GetConfig] Returning config: %+v", config)
	success(c, config)
}

// GetDashboard returns all dashboard data
func GetDashboard(c *gin.Context) {
	db := database.GetDB()

	// Get config
	var config models.SiteConfig
	db.First(&config)

	// Get standings
	standings, err := utils.ComputeStandings()
	if err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to compute standings")
		return
	}

	// Get recent matches (last 5 finished)
	var recentMatches []models.Match
	db.Preload("HomeTeam").Preload("AwayTeam").Preload("Events").
		Where("status = ?", models.MatchFinished).
		Order("updated_at DESC").Limit(5).Find(&recentMatches)

	// Get upcoming matches (next 5 scheduled)
	var upcomingMatches []models.Match
	db.Preload("HomeTeam").Preload("AwayTeam").Preload("Events").
		Where("status = ?", models.MatchScheduled).
		Order("matchday ASC, date ASC").Limit(5).Find(&upcomingMatches)

	// Get live matches
	var liveMatches []models.Match
	db.Preload("HomeTeam").Preload("AwayTeam").Preload("Events").
		Where("status = ?", models.MatchLive).
		Find(&liveMatches)

	// Get top scorers
	topScorers, _ := utils.GetTopScorers(10)

	// Get league stats
	stats, _ := utils.GetLeagueStats()

	// Get matchday info
	matchdays, _ := utils.GetMatchdayInfo()

	dashboard := models.DashboardData{
		Config:          config,
		Standings:       standings,
		RecentMatches:   recentMatches,
		UpcomingMatches: upcomingMatches,
		LiveMatches:     liveMatches,
		TopScorers:      topScorers,
		Stats:           stats,
		Matchdays:       matchdays,
	}

	success(c, dashboard)
}

// GetTeams returns all teams
func GetTeams(c *gin.Context) {
	db := database.GetDB()
	var teams []models.Team
	if err := db.Preload("Players").Find(&teams).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch teams")
		return
	}
	success(c, teams)
}

// GetTeam returns a single team by ID
func GetTeam(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	var team models.Team
	if err := db.Preload("Players").First(&team, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorResponse(c, http.StatusNotFound, "Team not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch team")
		return
	}
	success(c, team)
}

// GetStandings returns league standings
func GetStandings(c *gin.Context) {
	standings, err := utils.ComputeStandings()
	if err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to compute standings")
		return
	}
	success(c, standings)
}

// GetMatches returns all matches
func GetMatches(c *gin.Context) {
	db := database.GetDB()

	// Parse query params
	status := c.Query("status")
	matchday := c.Query("matchday")
	teamID := c.Query("teamId")

	query := db.Preload("HomeTeam").Preload("AwayTeam").Preload("Events")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if matchday != "" {
		query = query.Where("matchday = ?", matchday)
	}
	if teamID != "" {
		query = query.Where("home_team_id = ? OR away_team_id = ?", teamID, teamID)
	}

	var matches []models.Match
	if err := query.Order("matchday ASC, date ASC").Find(&matches).Error; err != nil {
		log.Printf("❌ [GetMatches] DB Error: %v", err)
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch matches")
		return
	}
	log.Printf("✅ [GetMatches] Found %d matches", len(matches))
	success(c, matches)
}

// GetMatch returns a single match by ID
func GetMatch(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	var match models.Match
	if err := db.Preload("HomeTeam").Preload("AwayTeam").Preload("Events").
		First(&match, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorResponse(c, http.StatusNotFound, "Match not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch match")
		return
	}
	success(c, match)
}

// GetPlayers returns all players
func GetPlayers(c *gin.Context) {
	db := database.GetDB()

	teamID := c.Query("teamId")
	query := db

	if teamID != "" {
		query = query.Where("team_id = ?", teamID)
	}

	var players []models.Player
	if err := query.Find(&players).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch players")
		return
	}
	success(c, players)
}

// GetTopScorers returns top goal scorers
func GetTopScorers(c *gin.Context) {
	scorers, err := utils.GetTopScorers(10)
	if err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch top scorers")
		return
	}
	success(c, scorers)
}

// RegisterTeam handles public team registration
func RegisterTeam(c *gin.Context) {
	db := database.GetDB()

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		log.Printf("❌ [RegisterTeam] Failed to parse multipart form: %v", err)
		errorResponse(c, http.StatusBadRequest, "Failed to parse form data: "+err.Error())
		return
	}

	// Extract form fields
	teamName := c.PostForm("teamName")
	captainName := c.PostForm("captainName")
	captainEmail := c.PostForm("captainEmail")
	captainPhone := c.PostForm("captainPhone")
	playersJSON := c.PostForm("players")

	log.Printf("📝 [RegisterTeam] Request received: Team=%s, Captain=%s", teamName, captainName)

	// Validate required fields
	if teamName == "" || captainName == "" || captainEmail == "" || captainPhone == "" {
		log.Println("❌ [RegisterTeam] Missing required fields")
		errorResponse(c, http.StatusBadRequest, "Missing required fields")
		return
	}

	// Parse players JSON
	type PlayerData struct {
		Name string `json:"name"`
	}
	var playersData []PlayerData
	if playersJSON != "" {
		// Parse players JSON string
		if err := json.Unmarshal([]byte(playersJSON), &playersData); err != nil {
			log.Printf("❌ [RegisterTeam] Invalid players JSON: %v", err)
			errorResponse(c, http.StatusBadRequest, "Invalid players data")
			return
		}
	}

	// Handle logo upload
	logoPath := ""
	file, header, err := c.Request.FormFile("logo")
	if err == nil {
		defer file.Close()
		uploadDir := "./uploads/logos"
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			log.Printf("❌ [RegisterTeam] Failed to create upload dir: %v", err)
			errorResponse(c, http.StatusInternalServerError, "Failed to create upload directory")
			return
		}

		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), header.Filename)
		savePath := filepath.Join(uploadDir, filename)

		out, err := os.Create(savePath)
		if err != nil {
			log.Printf("❌ [RegisterTeam] Failed to create logo file: %v", err)
			errorResponse(c, http.StatusInternalServerError, "Failed to save logo")
			return
		}
		defer out.Close()

		if _, err := io.Copy(out, file); err != nil {
			log.Printf("❌ [RegisterTeam] Failed to write logo file: %v", err)
			errorResponse(c, http.StatusInternalServerError, "Failed to save logo")
			return
		}

		logoPath = "/uploads/logos/" + filename
	}

	// Start Transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if tx.Error != nil {
		log.Printf("❌ [RegisterTeam] Failed to start transaction: %v", tx.Error)
		errorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	// Create team
	team := models.Team{
		Name:         teamName,
		ShortName:    utils.GenerateShortName(teamName),
		Captain:      captainName,
		CaptainEmail: captainEmail,
		CaptainPhone: captainPhone,
		LogoPath:     logoPath,
	}

	if err := tx.Create(&team).Error; err != nil {
		tx.Rollback()
		log.Printf("❌ [RegisterTeam] Failed to create team in DB: %v", err)
		errorResponse(c, http.StatusInternalServerError, "Failed to create team: "+err.Error())
		return
	}

	// Create players
	for i, pd := range playersData {
		if pd.Name == "" {
			continue // Skip empty player names
		}
		player := models.Player{
			TeamID:   team.ID,
			Name:     pd.Name,
			Number:   i + 1,
			Position: models.PositionMID, // Default position
		}
		if err := tx.Create(&player).Error; err != nil {
			tx.Rollback()
			log.Printf("❌ [RegisterTeam] Failed to create player %s: %v", pd.Name, err)
			errorResponse(c, http.StatusInternalServerError, fmt.Sprintf("Failed to create player %s", pd.Name))
			return
		}
	}

	// Commit Transaction
	if err := tx.Commit().Error; err != nil {
		log.Printf("❌ [RegisterTeam] Failed to commit transaction: %v", err)
		errorResponse(c, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	// Reload team with players for response
	db.Preload("Players").First(&team, "id = ?", team.ID)

	log.Printf("✅ [RegisterTeam] Successfully registered team: %s (ID: %s)", team.Name, team.ID)
	success(c, team)
}

// ============ Admin Handlers ============

// AdminLogin handles admin login
func AdminLogin(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid request")
		return
	}

	// Simple authentication (in production, use proper auth)
	if req.Username == "admin" && req.Password == "admin123" {
		c.SetCookie("admin_token", "secret-admin-token", 3600, "/", "", false, false)
		success(c, gin.H{"message": "Login successful"})
		return
	}

	errorResponse(c, http.StatusUnauthorized, "Invalid credentials")
}

// CreateTeam creates a new team
func CreateTeam(c *gin.Context) {
	db := database.GetDB()

	// Parse Multipart Form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10 MB limit
		errorResponse(c, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	var team models.Team
	team.Name = c.PostForm("name")
	team.ShortName = c.PostForm("shortName")
	team.Cohort = c.PostForm("cohort")
	team.Captain = c.PostForm("captain")
	team.CaptainEmail = c.PostForm("captainEmail")
	team.CaptainPhone = c.PostForm("captainPhone")
	team.Motto = c.PostForm("motto")
	team.PrimaryColor = c.PostForm("primaryColor")
	team.SecondaryColor = c.PostForm("secondaryColor")
	team.QRCode = c.PostForm("qrCode")

	if team.Name == "" {
		errorResponse(c, http.StatusBadRequest, "Team name is required")
		return
	}

	if team.ShortName == "" {
		team.ShortName = utils.GenerateShortName(team.Name)
	}

	// Handle Logo Upload
	file, err := c.FormFile("logo")
	if err == nil {
		// Ensure uploads directory exists
		uploadDir := "./uploads"
		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, 0755)
		}

		// Save file
		filename := fmt.Sprintf("team_%s_%s", uuid.New().String()[:8], filepath.Base(file.Filename))
		filepath := filepath.Join(uploadDir, filename)
		if err := c.SaveUploadedFile(file, filepath); err != nil {
			log.Printf("❌ [CreateTeam] Failed to save logo: %v", err)
			errorResponse(c, http.StatusInternalServerError, "Failed to save logo")
			return
		}
		team.LogoPath = "/uploads/" + filename
	}

	// Start Transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(&team).Error; err != nil {
		tx.Rollback()
		log.Printf("❌ [CreateTeam] Failed to create team: %v", err)
		errorResponse(c, http.StatusInternalServerError, "Failed to create team")
		return
	}

	// Handle Players
	playersJSON := c.PostForm("players")
	if playersJSON != "" {
		var players []models.Player
		if err := json.Unmarshal([]byte(playersJSON), &players); err != nil {
			tx.Rollback()
			log.Printf("❌ [CreateTeam] Failed to parse players JSON: %v", err)
			errorResponse(c, http.StatusBadRequest, "Invalid players data")
			return
		}

		for i := range players {
			players[i].TeamID = team.ID
			if err := tx.Create(&players[i]).Error; err != nil {
				tx.Rollback()
				log.Printf("❌ [CreateTeam] Failed to create player %d: %v", i, err)
				errorResponse(c, http.StatusInternalServerError, "Failed to create players")
				return
			}
		}
		team.Players = players
	} else {
		// Create default players if none provided
		players := utils.GenerateDefaultPlayers(team.ID)
		for i := range players {
			if err := tx.Create(&players[i]).Error; err != nil {
				tx.Rollback()
				log.Printf("❌ [CreateTeam] Failed to create default player %d: %v", i, err)
				errorResponse(c, http.StatusInternalServerError, "Failed to create default players")
				return
			}
		}
		team.Players = players
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("❌ [CreateTeam] Failed to commit transaction: %v", err)
		errorResponse(c, http.StatusInternalServerError, "Failed to create team")
		return
	}

	success(c, team)
}

// UpdateTeam updates a team
func UpdateTeam(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	var team models.Team
	if err := db.First(&team, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorResponse(c, http.StatusNotFound, "Team not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch team")
		return
	}

	var updates models.Team
	if err := c.ShouldBindJSON(&updates); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid team data")
		return
	}

	// Update fields
	team.Name = updates.Name
	team.ShortName = updates.ShortName
	team.Cohort = updates.Cohort
	team.Captain = updates.Captain
	team.CaptainEmail = updates.CaptainEmail
	team.CaptainPhone = updates.CaptainPhone
	team.Motto = updates.Motto
	team.PrimaryColor = updates.PrimaryColor
	team.SecondaryColor = updates.SecondaryColor
	team.LogoPath = updates.LogoPath

	if err := db.Save(&team).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to update team")
		return
	}

	success(c, team)
}

// DeleteTeam deletes a team
func DeleteTeam(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	// Check if team has matches
	var matchCount int64
	db.Model(&models.Match{}).Where("home_team_id = ? OR away_team_id = ?", id, id).Count(&matchCount)
	if matchCount > 0 {
		errorResponse(c, http.StatusBadRequest, "Cannot delete team with existing matches")
		return
	}

	if err := db.Where("team_id = ?", id).Delete(&models.Player{}).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to delete players")
		return
	}

	if err := db.Where("id = ?", id).Delete(&models.Team{}).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to delete team")
		return
	}

	success(c, gin.H{"message": "Team deleted successfully"})
}

// GenerateTeams generates teams with generic names
func GenerateTeams(c *gin.Context) {
	var req models.GenerateTeamsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid request")
		return
	}

	teams, err := utils.GenerateTeams(req.Count)
	if err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to generate teams")
		return
	}

	success(c, gin.H{
		"message": fmt.Sprintf("Generated %d teams", len(teams)),
		"teams":   teams,
	})
}

// CreatePlayer creates a new player
func CreatePlayer(c *gin.Context) {
	db := database.GetDB()

	var player models.Player
	if err := c.ShouldBindJSON(&player); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid player data")
		return
	}

	// Verify team exists
	var team models.Team
	if err := db.First(&team, "id = ?", player.TeamID).Error; err != nil {
		errorResponse(c, http.StatusBadRequest, "Team not found")
		return
	}

	if err := db.Create(&player).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to create player")
		return
	}

	success(c, player)
}

// UpdatePlayer updates a player
func UpdatePlayer(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	var player models.Player
	if err := db.First(&player, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorResponse(c, http.StatusNotFound, "Player not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch player")
		return
	}

	var updates models.Player
	if err := c.ShouldBindJSON(&updates); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid player data")
		return
	}

	player.Name = updates.Name
	player.Number = updates.Number
	player.Position = updates.Position
	player.IsCaptain = updates.IsCaptain
	player.IsSubstitute = updates.IsSubstitute
	player.Goals = updates.Goals
	player.Assists = updates.Assists
	player.YellowCards = updates.YellowCards
	player.RedCards = updates.RedCards
	player.MatchesPlayed = updates.MatchesPlayed

	if err := db.Save(&player).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to update player")
		return
	}

	success(c, player)
}

// DeletePlayer deletes a player
func DeletePlayer(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	if err := db.Where("id = ?", id).Delete(&models.Player{}).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to delete player")
		return
	}

	success(c, gin.H{"message": "Player deleted successfully"})
}

// CreateMatch creates a new match
func CreateMatch(c *gin.Context) {
	db := database.GetDB()

	var match models.Match
	if err := c.ShouldBindJSON(&match); err != nil {
		log.Printf("❌ [CreateMatch] Invalid JSON: %v", err)
		errorResponse(c, http.StatusBadRequest, "Invalid match data")
		return
	}

	// Verify teams exist
	var homeTeam, awayTeam models.Team
	if err := db.First(&homeTeam, "id = ?", match.HomeTeamID).Error; err != nil {
		log.Printf("❌ [CreateMatch] Home team not found: %s", match.HomeTeamID)
		errorResponse(c, http.StatusBadRequest, "Home team not found")
		return
	}
	if err := db.First(&awayTeam, "id = ?", match.AwayTeamID).Error; err != nil {
		log.Printf("❌ [CreateMatch] Away team not found: %s", match.AwayTeamID)
		errorResponse(c, http.StatusBadRequest, "Away team not found")
		return
	}

	if match.HomeTeamID == match.AwayTeamID {
		errorResponse(c, http.StatusBadRequest, "Home and away teams cannot be the same")
		return
	}

	if err := db.Create(&match).Error; err != nil {
		log.Printf("❌ [CreateMatch] Database creation failed: %v", err)
		errorResponse(c, http.StatusInternalServerError, "Failed to create match")
		return
	}

	log.Printf("✅ [CreateMatch] Match created between %s and %s", homeTeam.Name, awayTeam.Name)
	success(c, match)
}

// UpdateMatch updates a match
func UpdateMatch(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	var match models.Match
	if err := db.First(&match, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorResponse(c, http.StatusNotFound, "Match not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch match")
		return
	}

	var updates models.Match
	if err := c.ShouldBindJSON(&updates); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid match data")
		return
	}

	match.Matchday = updates.Matchday
	match.Date = updates.Date
	match.Time = updates.Time
	match.Venue = updates.Venue
	match.HomeTeamID = updates.HomeTeamID
	match.AwayTeamID = updates.AwayTeamID
	match.HomeScore = updates.HomeScore
	match.AwayScore = updates.AwayScore
	match.Status = updates.Status
	match.Round = updates.Round
	match.MVP = updates.MVP

	if err := db.Save(&match).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to update match")
		return
	}

	success(c, match)
}

// UpdateMatchScore updates match score
func UpdateMatchScore(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid score data")
		return
	}

	if err := utils.UpdateMatchScore(id, req.HomeScore, req.AwayScore); err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to update score")
		return
	}

	success(c, gin.H{"message": "Score updated successfully"})
}

// DeleteMatch deletes a match
func DeleteMatch(c *gin.Context) {
	db := database.GetDB()
	id := c.Param("id")

	if err := db.Where("id = ?", id).Delete(&models.Match{}).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to delete match")
		return
	}

	success(c, gin.H{"message": "Match deleted successfully"})
}

// GenerateMatches generates round-robin matches
func GenerateMatches(c *gin.Context) {
	var req models.GenerateMatchesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Use default start date (today)
		req.StartDate = time.Now().Format("2006-01-02")
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		startDate = time.Now()
	}

	matches, err := utils.GenerateRoundRobinMatches(startDate)
	if err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	success(c, gin.H{
		"message":   fmt.Sprintf("Generated %d matches", len(matches)),
		"matches":   matches,
		"matchdays": len(matches) / 2, // Approximate
	})
}

// UpdateConfig updates site configuration
func UpdateConfig(c *gin.Context) {
	db := database.GetDB()

	var config models.SiteConfig
	if err := db.First(&config).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch config")
		return
	}

	contentType := c.GetHeader("Content-Type")
	log.Printf("ℹ️ [UpdateConfig] Content-Type: %s", contentType)

	if contentType == "application/json" {
		var updates models.SiteConfig
		if err := c.ShouldBindJSON(&updates); err != nil {
			errorResponse(c, http.StatusBadRequest, "Invalid config data")
			return
		}
		// Update fields from JSON
		if updates.Title != "" {
			config.Title = updates.Title
		}
		if updates.Subtitle != "" {
			config.Subtitle = updates.Subtitle
		}
		if updates.HeroSubtitle != "" {
			config.HeroSubtitle = updates.HeroSubtitle
		}
		if updates.HeroTitle1 != "" {
			config.HeroTitle1 = updates.HeroTitle1
		}
		if updates.HeroTitle2 != "" {
			config.HeroTitle2 = updates.HeroTitle2
		}
		if updates.HeroTitle3 != "" {
			config.HeroTitle3 = updates.HeroTitle3
		}
		if updates.MatchStage != "" {
			config.MatchStage = updates.MatchStage
		}
		if updates.FeaturedMatchID != "" {
			config.FeaturedMatchID = updates.FeaturedMatchID
		}
		config.AutoUpdateMatches = updates.AutoUpdateMatches

	} else {
		// Handle Multipart Form (for Logo Upload)
		if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
			errorResponse(c, http.StatusBadRequest, "Failed to parse form data")
			return
		}

		if val := c.PostForm("title"); val != "" {
			config.Title = val
		}
		if val := c.PostForm("subtitle"); val != "" {
			config.Subtitle = val
		}
		if val := c.PostForm("heroSubtitle"); val != "" {
			config.HeroSubtitle = val
		}
		if val := c.PostForm("heroTitle1"); val != "" {
			config.HeroTitle1 = val
		}
		if val := c.PostForm("heroTitle2"); val != "" {
			config.HeroTitle2 = val
		}
		if val := c.PostForm("heroTitle3"); val != "" {
			config.HeroTitle3 = val
		}
		if val := c.PostForm("matchStage"); val != "" {
			config.MatchStage = val
		}
		if val := c.PostForm("featuredMatchId"); val != "" {
			config.FeaturedMatchID = val
		}
		if val := c.PostForm("autoUpdateMatches"); val != "" {
			config.AutoUpdateMatches = val == "true"
		}

		// Handle Logo File
		file, err := c.FormFile("logo")
		if err == nil {
			// Ensure uploads directory exists
			uploadDir := "./uploads"
			if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
				os.Mkdir(uploadDir, 0755)
			}

			// Save file
			filename := fmt.Sprintf("logo_%s_%s", uuid.New().String()[:8], filepath.Base(file.Filename))
			filepath := filepath.Join(uploadDir, filename)
			if err := c.SaveUploadedFile(file, filepath); err != nil {
				log.Printf("❌ [UpdateConfig] Failed to save logo: %v", err)
				errorResponse(c, http.StatusInternalServerError, "Failed to save logo")
				return
			}
			config.LogoPath = "/uploads/" + filename
		}
	}

	if err := db.Save(&config).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to update config")
		return
	}

	success(c, config)
}

// ResetAll resets all data
func ResetAll(c *gin.Context) {
	if err := utils.ResetAllData(); err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to reset data")
		return
	}
	success(c, gin.H{"message": "All data reset successfully"})
}

// ResetMatches resets only matches
func ResetMatches(c *gin.Context) {
	if err := utils.ResetMatches(); err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to reset matches")
		return
	}
	success(c, gin.H{"message": "Matches reset successfully"})
}

// AdminMiddleware checks admin authentication
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("admin_token")
		if err != nil || token != "secret-admin-token" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "Unauthorized",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
