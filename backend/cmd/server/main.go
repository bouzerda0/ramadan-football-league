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

	// Initialize Database
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "database.db"
	}
	if err := database.Init(dbPath); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create router
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:4173"} // Vite local & preview ports
	config.AllowOriginFunc = func(origin string) bool {
		// Allow local development
		if origin == "http://localhost:5173" || origin == "http://localhost:4173" {
			return true
		}
		// Allow Railway domains (e.g. https://web-production-xxxx.up.railway.app)
		// This uses simple suffix matching for *.up.railway.app
		// In a real production setup, you might want to be more strict
		if len(origin) >= 15 && origin[len(origin)-15:] == ".up.railway.app" {
			return true
		}
		return false
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true // Important for cookies/sessions if used
	r.Use(cors.New(config))

	// Public API routes
	api := r.Group("/api")
	{
		api.GET("/status", handlers.GetStatus)
		api.GET("/config", handlers.GetConfig)
		api.GET("/teams", handlers.GetTeams)
		api.GET("/matches", handlers.GetMatches)
		api.GET("/standings", handlers.GetStandings)
		// api.GET("/stats", handlers.GetLeagueStats)

		// Admin Login
		api.POST("/admin/login", handlers.AdminLogin)

		// Protected Admin Routes
		protected := api.Group("/admin")
		protected.Use(handlers.AdminMiddleware())
		{
			protected.POST("/config", handlers.UpdateConfig)
			protected.POST("/matches/generate", handlers.GenerateMatches)
			protected.POST("/teams/generate", handlers.GenerateTeams)
			protected.POST("/matches/:id/score", handlers.UpdateMatchScore)
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

	log.Println("========================================")
	log.Println("  Ramadan Football League API Server")
	log.Println("========================================")
	log.Printf("  Server: http://localhost:%s", port)
	log.Printf("  API Docs: http://localhost:%s/api/status", port)
	log.Println("========================================")

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
