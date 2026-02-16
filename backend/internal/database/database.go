package database

import (
	"log"
	"os"
	"path/filepath"

	"ramadan-league/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Init initializes the database connection
func Init(dbPath string) error {
	var db *gorm.DB
	var err error

	// 1. Check for Railway PostgreSQL (Production)
	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL != "" {
		log.Println("🌍 Connecting to Railway PostgreSQL...")
		db, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info), // بدلتها لـ Info باش تشوف الأخطاء إلا وقعو
		})
	} else {
		// 2. Fallback to SQLite (Local / Development)
		log.Println("📂 Connecting to SQLite (Pure Go)...")

		dir := filepath.Dir(dbPath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}

		db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	}

	if err != nil {
		log.Printf("❌ Fatal Database Error: %v", err)
		return err
	}

	DB = db
	log.Println("✅ Database connection established")

	// 3. Auto Migrate
	log.Println("🔄 Running migrations...")
	if err := migrate(); err != nil {
		log.Printf("❌ Migration failed: %v", err)
		return err
	}

	// 4. Seed Data
	log.Println("🌱 Seeding default data...")
	if err := seed(); err != nil {
		log.Printf("❌ Seeding failed: %v", err)
		return err
	}

	log.Println("🚀 Database initialized successfully")
	return nil
}

// migrate auto-migrates all models
func migrate() error {
	return DB.AutoMigrate(
		&models.Team{},
		&models.Player{},
		&models.Match{},
		// &models.MatchEvent{},
		&models.SiteConfig{},
	)
}

// seed seeds default data if not exists
func seed() error {
	// Seed default site config
	var configCount int64
<<<<<<< HEAD
	if DB.Migrator().HasTable(&models.SiteConfig{}) {
		DB.Model(&models.SiteConfig{}).Count(&configCount)
		if configCount == 0 {
			defaultConfig := models.SiteConfig{
				Title:             "UMPO League",
				Subtitle:          "RFL 2026",
				HeroSubtitle:      "UMPO •  High School Tournament 2026
=======
	DB.Model(&models.SiteConfig{}).Count(&configCount)
	if configCount == 0 {
		defaultConfig := models.SiteConfig{
			Title:             "UMPO League",
			Subtitle:          "RFL 2026",
			HeroSubtitle:      "UMPO • High School Tournament 2026",
			HeroTitle1:        "RAMADAN",
			HeroTitle2:        "FOOTBALL",
			HeroTitle3:        "LEAGUE",
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
		}
		if err := DB.Create(&defaultConfig).Error; err != nil {
			return err
		}
		log.Println("Default site config created")
	}
>>>>>>> c3fc652 (change)

",
				HeroTitle1:        "RAMADAN",
				HeroTitle2:        "FOOTBALL",
				HeroTitle3:        "LEAGUE",
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
			}
			if err := DB.Create(&defaultConfig).Error; err != nil {
				return err
			}
			log.Println("✅ Default site config created")
		}
	}
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
