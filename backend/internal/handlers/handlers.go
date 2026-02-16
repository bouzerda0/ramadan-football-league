package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"ramadan-league/internal/database"
	"ramadan-league/internal/models"
	"ramadan-league/internal/utils"

	"github.com/gin-gonic/gin"
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
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch matches")
		return
	}
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
		errorResponse(c, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	// Extract form fields
	teamName := c.PostForm("teamName")
	captainName := c.PostForm("captainName")
	captainEmail := c.PostForm("captainEmail")
	captainPhone := c.PostForm("captainPhone")
	playersJSON := c.PostForm("players")

	// Validate required fields
	if teamName == "" || captainName == "" || captainEmail == "" || captainPhone == "" {
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
			errorResponse(c, http.StatusBadRequest, "Invalid players data")
			return
		}
	}

	// Handle logo upload (optional)
	logoPath := ""
	file, header, err := c.Request.FormFile("logo")
	if err == nil {
		defer file.Close()

		// Save file to uploads directory
		uploadDir := "./uploads/logos"
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			errorResponse(c, http.StatusInternalServerError, "Failed to create upload directory")
			return
		}

		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), header.Filename)
		filepath := filepath.Join(uploadDir, filename)

		out, err := os.Create(filepath)
		if err != nil {
			errorResponse(c, http.StatusInternalServerError, "Failed to save logo")
			return
		}
		defer out.Close()

		if _, err := io.Copy(out, file); err != nil {
			errorResponse(c, http.StatusInternalServerError, "Failed to save logo")
			return
		}

		logoPath = "/uploads/logos/" + filename
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

	if err := db.Create(&team).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to create team")
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
		db.Create(&player)
	}

	// Reload team with players
	db.Preload("Players").First(&team, "id = ?", team.ID)

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

	var team models.Team
	if err := c.ShouldBindJSON(&team); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid team data")
		return
	}

	if team.ShortName == "" {
		team.ShortName = utils.GenerateShortName(team.Name)
	}

	if err := db.Create(&team).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to create team")
		return
	}

	// Create default players
	players := utils.GenerateDefaultPlayers(team.ID)
	for i := range players {
		db.Create(&players[i])
	}
	team.Players = players

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
		errorResponse(c, http.StatusBadRequest, "Invalid match data")
		return
	}

	// Verify teams exist
	var homeTeam, awayTeam models.Team
	if err := db.First(&homeTeam, "id = ?", match.HomeTeamID).Error; err != nil {
		errorResponse(c, http.StatusBadRequest, "Home team not found")
		return
	}
	if err := db.First(&awayTeam, "id = ?", match.AwayTeamID).Error; err != nil {
		errorResponse(c, http.StatusBadRequest, "Away team not found")
		return
	}

	if match.HomeTeamID == match.AwayTeamID {
		errorResponse(c, http.StatusBadRequest, "Home and away teams cannot be the same")
		return
	}

	if err := db.Create(&match).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to create match")
		return
	}

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

	var updates models.SiteConfig
	if err := c.ShouldBindJSON(&updates); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid config data")
		return
	}

	var config models.SiteConfig
	if err := db.First(&config).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to fetch config")
		return
	}

	// Update fields
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
