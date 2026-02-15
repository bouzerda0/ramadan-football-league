package database

import (
	"log"
	"os"
	"path/filepath"

	"ramadan-league/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Init initializes the database connection
func Init(dbPath string) error {
	// Ensure directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// Open database connection
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return err
	}

	DB = db

	// Auto migrate models
	if err := migrate(); err != nil {
		return err
	}

	// Seed default data
	if err := seed(); err != nil {
		return err
	}

	log.Println("Database initialized successfully")
	return nil
}

// migrate auto-migrates all models
func migrate() error {
	return DB.AutoMigrate(
		&models.Team{},
		&models.Player{},
		&models.Match{},
		&models.MatchEvent{},
		&models.SiteConfig{},
	)
}

// seed seeds default data if not exists
func seed() error {
	// Seed default site config
	var configCount int64
	DB.Model(&models.SiteConfig{}).Count(&configCount)
	if configCount == 0 {
		defaultConfig := models.SiteConfig{
			Title:             "Zone 01 Oujda",
			Subtitle:          "RFL 2026",
			HeroSubtitle:      "Zone 01 Oujda • School Tournament 2026",
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

	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// Close closes the database connection
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
