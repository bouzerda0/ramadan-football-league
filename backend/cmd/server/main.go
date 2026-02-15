package main

import (
	"log"
	"os"
	"path/filepath"

	"ramadan-league/internal/database"
	"ramadan-league/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Set up data directory
	dataDir := "./data"
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Fatal("Failed to create data directory:", err)
	}

	// Initialize database
	dbPath := filepath.Join(dataDir, "league.db")
	if err := database.Init(dbPath); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create router
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Public API routes
	api := r.Group("/api")
	{
		api.GET("/status", handlers.GetStatus)
		api.GET("/config", handlers.GetConfig)
		api.GET("/dashboard", handlers.GetDashboard)
		api.GET("/teams", handlers.GetTeams)
		api.GET("/teams/:id", handlers.GetTeam)
		api.GET("/standings", handlers.GetStandings)
		api.GET("/matches", handlers.GetMatches)
		api.GET("/matches/:id", handlers.GetMatch)
		api.GET("/players", handlers.GetPlayers)
		api.GET("/top-scorers", handlers.GetTopScorers)
	}

	// Admin routes
	admin := r.Group("/api/admin")
	{
		admin.POST("/login", handlers.AdminLogin)

		// Protected admin routes
		protected := admin.Group("/")
		protected.Use(handlers.AdminMiddleware())
		{
			// Teams
			protected.POST("/teams", handlers.CreateTeam)
			protected.PUT("/teams/:id", handlers.UpdateTeam)
			protected.DELETE("/teams/:id", handlers.DeleteTeam)
			protected.POST("/teams/generate", handlers.GenerateTeams)

			// Players
			protected.POST("/players", handlers.CreatePlayer)
			protected.PUT("/players/:id", handlers.UpdatePlayer)
			protected.DELETE("/players/:id", handlers.DeletePlayer)

			// Matches
			protected.POST("/matches", handlers.CreateMatch)
			protected.PUT("/matches/:id", handlers.UpdateMatch)
			protected.PUT("/matches/:id/score", handlers.UpdateMatchScore)
			protected.DELETE("/matches/:id", handlers.DeleteMatch)
			protected.POST("/matches/generate", handlers.GenerateMatches)

			// Config
			protected.PUT("/config", handlers.UpdateConfig)

			// Reset
			protected.POST("/reset/all", handlers.ResetAll)
			protected.POST("/reset/matches", handlers.ResetMatches)
		}
	}

	// Serve static files (frontend) - try multiple paths to work from any working directory
	distPath := ""
	for _, candidate := range []string{
		"./frontend/dist",        // from backend/
		"../frontend/dist",       // from backend/cmd/
		"../../frontend/dist",    // from backend/cmd/server/
		"../../../frontend/dist", // fallback
	} {
		if _, err := os.Stat(candidate); err == nil {
			distPath = candidate
			break
		}
	}
	if distPath == "" {
		log.Println("WARNING: frontend/dist not found, serving API only")
		distPath = "./frontend/dist" // fallback
	}

	r.Static("/uploads", "./uploads")
	r.StaticFile("/", filepath.Join(distPath, "index.html"))
	r.StaticFile("/index.html", filepath.Join(distPath, "index.html"))
	r.Static("/assets", filepath.Join(distPath, "assets"))

	// SPA fallback
	r.NoRoute(func(c *gin.Context) {
		c.File(filepath.Join(distPath, "index.html"))
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("=" + "========================================")
	log.Println("  Ramadan Football League API Server")
	log.Println("========================================")
	log.Printf("  Server: http://localhost:%s", port)
	log.Printf("  API Docs: http://localhost:%s/api/status", port)
	log.Println("========================================")

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
