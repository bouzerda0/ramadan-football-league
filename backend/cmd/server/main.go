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

	// 1. Initialize Database
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "database.db"
	}

	if err := database.Init(dbPath); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// 2. Set Gin mode (Release for production)
	gin.SetMode(gin.ReleaseMode)

	// 3. Create router
	r := gin.Default()

	// 4. CORS configuration (Fixed for 405 & Network Error)
	config := cors.DefaultConfig()
	// Allow specific origins for credentials support
config.AllowOrigins = []string{
    "http://localhost:5173", 
    "https://app-production-f65a.up.railway.app",
}

	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}

	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Accept", "Authorization"}

	config.AllowCredentials = true

	r.Use(cors.New(config))

	// 5. Public API routes
	api := r.Group("/api")
	{
		api.GET("/status", handlers.GetStatus)
		api.GET("/config", handlers.GetConfig)
		api.GET("/teams", handlers.GetTeams)
		api.GET("/matches", handlers.GetMatches)
		api.GET("/standings", handlers.GetStandings)
		// api.GET("/stats", handlers.GetLeagueStats)

		// Public Moments (Fetch only)
		api.GET("/moments", handlers.GetMoments)
		// api.POST("/moments/upload", handlers.UploadMoment) // Disabled public upload

		// Public Registration
		api.POST("/register", handlers.RegisterTeam)

		// Admin Login (POST)
		api.POST("/admin/login", handlers.AdminLogin)

		// Protected Admin Routes
		protected := api.Group("/admin")
		protected.Use(handlers.AdminMiddleware())
		{
			protected.GET("/teams", handlers.GetTeams)     // Used by AdminMatches
			protected.GET("/matches", handlers.GetMatches) // Used by AdminMatches

			protected.POST("/matches", handlers.CreateMatch)
			protected.PUT("/matches/:id", handlers.UpdateMatch)
			protected.DELETE("/matches/:id", handlers.DeleteMatch)

			protected.PUT("/config", handlers.UpdateConfig)
			protected.POST("/matches/generate", handlers.GenerateMatches)
			protected.POST("/teams/generate", handlers.GenerateTeams)
			protected.POST("/matches/:id/score", handlers.UpdateMatchScore)
			protected.POST("/reset/matches", handlers.ResetMatches)

			// Team Management
			protected.POST("/teams", handlers.CreateTeam)
			protected.PUT("/teams/:id", handlers.UpdateTeam)
			protected.DELETE("/teams/:id", handlers.DeleteTeam)

			// Player Management
			protected.POST("/players", handlers.CreatePlayer)
			protected.PUT("/players/:id", handlers.UpdatePlayer)
			protected.DELETE("/players/:id", handlers.DeletePlayer)

			// Moments Management
			protected.GET("/moments", handlers.GetAdminMoments)
			protected.POST("/moments", handlers.AdminUploadMoment) // Admin Upload
			protected.PUT("/moments/:id/status", handlers.UpdateMomentStatus)
			protected.DELETE("/moments/:id", handlers.DeleteMoment) // Admin Delete
		}
	}

	// 6. Serve static files (Frontend)
	distPath := ""
	for _, candidate := range []string{
		"./frontend/dist",
		"../frontend/dist",
		"../../frontend/dist",
		"../../../frontend/dist",
		"dist",
		"/app/frontend/dist",
	} {
		if _, err := os.Stat(candidate); err == nil {
			distPath = candidate
			break
		}
	}

	if distPath == "" {
		log.Println("WARNING: frontend/dist not found, serving API only")
	} else {
		// Serve Static Files
		r.Static("/assets", filepath.Join(distPath, "assets"))
		r.StaticFile("/favicon.ico", filepath.Join(distPath, "favicon.ico"))

		r.NoRoute(func(c *gin.Context) {
			if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
				c.JSON(404, gin.H{"error": "API route not found"})
				return
			}
			c.File(filepath.Join(distPath, "index.html"))
		})
	}

	r.Static("/uploads", "./uploads")

	// 7. Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("========================================")
	log.Println("  Ramadan Football League API Server")
	log.Printf("  Listening on port: %s", port)
	log.Println("========================================")

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
