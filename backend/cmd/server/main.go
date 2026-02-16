package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Team struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Group string `json:"group"`
	Stats Stats  `json:"stats"`
}

type Stats struct {
	Played int `json:"played"`
	Won    int `json:"won"`
	Drawn  int `json:"drawn"`
	Lost   int `json:"lost"`
	Points int `json:"points"`
	GF     int `json:"gf"` // Goals For
	GA     int `json:"ga"` // Goals Against
}

type Match struct {
	ID       string `json:"id"`
	HomeTeam string `json:"homeTeam"`
	AwayTeam string `json:"awayTeam"`
	Date     string `json:"date"`
	Time     string `json:"time"`
	Status   string `json:"status"` // "scheduled", "live", "finished"
	Score    string `json:"score"`
}

var teams = []Team{
	{ID: "t1", Name: "Al-Mountakhab", Group: "A", Stats: Stats{Played: 3, Won: 2, Drawn: 1, Lost: 0, Points: 7, GF: 5, GA: 2}},
	{ID: "t2", Name: "Les Aigles", Group: "A", Stats: Stats{Played: 3, Won: 1, Drawn: 1, Lost: 1, Points: 4, GF: 3, GA: 3}},
	{ID: "t3", Name: "Al-Wahda", Group: "B", Stats: Stats{Played: 3, Won: 0, Drawn: 2, Lost: 1, Points: 2, GF: 1, GA: 4}},
	{ID: "t4", Name: "Al-Amal", Group: "B", Stats: Stats{Played: 3, Won: 3, Drawn: 0, Lost: 0, Points: 9, GF: 8, GA: 1}},
}

var matches = []Match{
	{ID: "m1", HomeTeam: "Al-Mountakhab", AwayTeam: "Les Aigles", Date: "2026-03-15", Time: "16:00", Status: "finished", Score: "2-1"},
	{ID: "m2", HomeTeam: "Al-Wahda", AwayTeam: "Al-Amal", Date: "2026-03-16", Time: "16:00", Status: "scheduled", Score: "-"},
}

// --- Main Function ---

func main() {
	// Set Gin to Release Mode (for production)
	// gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	// 1. CORS Configuration (مهم بزاف باش React تخدم)
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"} // كنسمحو لـ أي دومين (Vercel, Localhost)
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// 3. API Routes
	api := r.Group("/api")
	{
		// Test Status
		api.GET("/status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok", "uptime": "100%"})
		})

		// Get All Teams
		api.GET("/teams", func(c *gin.Context) {
			c.JSON(http.StatusOK, teams)
		})

		// Get Standings (Ranking)
		api.GET("/standings", func(c *gin.Context) {
			// For now, simply return teams (Frontend will sort them usually)
			c.JSON(http.StatusOK, teams)
		})

		// Get Matches
		api.GET("/matches", func(c *gin.Context) {
			c.JSON(http.StatusOK, matches)
		})

		// Register Route (Dummy)
		api.POST("/register", func(c *gin.Context) {
			c.JSON(http.StatusCreated, gin.H{"message": "Registration received (Mock)"})
		})
	}

	// 4. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("========================================")
	log.Println("  Ramadan Football League API is Ready  ")
	log.Printf("  Server running on port: %s", port)
	log.Println("========================================")

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
