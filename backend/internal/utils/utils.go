package utils

import (
	"fmt"
	"strings"
	"time"

	"ramadan-league/internal/database"
	"ramadan-league/internal/models"

	"gorm.io/gorm"
)

// GenerateShortName generates a short name from a full name
func GenerateShortName(name string) string {
	if len(name) <= 3 {
		return strings.ToUpper(name)
	}

	// Try to get first 3 characters
	short := strings.ToUpper(name[:3])
	return short
}

// GenerateTeams generates teams with generic names (Team1, Team2, etc.)
func GenerateTeams(count int) ([]models.Team, error) {
	db := database.GetDB()
	teams := make([]models.Team, 0, count)

	for i := 1; i <= count; i++ {
		team := models.Team{
			Name:           fmt.Sprintf("Team%d", i),
			ShortName:      fmt.Sprintf("T%d", i),
			Cohort:         "",
			Captain:        "",
			CaptainEmail:   "",
			CaptainPhone:   "",
			Motto:          "",
			PrimaryColor:   "#D4A018",
			SecondaryColor: "#0B0F1C",
		}

		if err := db.Create(&team).Error; err != nil {
			return nil, err
		}

		// Generate 11 default players for each team
		players := GenerateDefaultPlayers(team.ID)
		for j := range players {
			if err := db.Create(&players[j]).Error; err != nil {
				return nil, err
			}
		}

		team.Players = players
		teams = append(teams, team)
	}

	return teams, nil
}

// GenerateDefaultPlayers generates 11 default players for a team
func GenerateDefaultPlayers(teamID string) []models.Player {
	positions := []models.PlayerPosition{
		models.PositionGK,
		models.PositionDEF, models.PositionDEF, models.PositionDEF, models.PositionDEF,
		models.PositionMID, models.PositionMID, models.PositionMID,
		models.PositionFWD, models.PositionFWD, models.PositionFWD,
	}

	players := make([]models.Player, 11)
	for i := 0; i < 11; i++ {
		isCaptain := i == 0 // First player is captain
		players[i] = models.Player{
			TeamID:       teamID,
			Name:         fmt.Sprintf("Player %d", i+1),
			Number:       i + 1,
			Position:     positions[i],
			IsCaptain:    isCaptain,
			IsSubstitute: false,
		}
	}
	return players
}

// GenerateRoundRobinMatches generates a round-robin schedule for all teams
func GenerateRoundRobinMatches(startDate time.Time) ([]models.Match, error) {
	db := database.GetDB()

	// Get all teams
	var teams []models.Team
	if err := db.Find(&teams).Error; err != nil {
		return nil, err
	}

	if len(teams) < 2 {
		return nil, fmt.Errorf("need at least 2 teams to generate matches")
	}

	// Delete existing matches
	if err := db.Where("1 = 1").Delete(&models.MatchEvent{}).Error; err != nil {
		return nil, err
	}
	if err := db.Where("1 = 1").Delete(&models.Match{}).Error; err != nil {
		return nil, err
	}

	// Reset team statistics
	if err := db.Model(&models.Team{}).Updates(map[string]interface{}{
		"played":          0,
		"won":             0,
		"drawn":           0,
		"lost":            0,
		"goals_for":       0,
		"goals_against":   0,
		"goal_difference": 0,
		"points":          0,
		"form":            "",
	}).Error; err != nil {
		return nil, err
	}

	// Generate round-robin schedule using circle method
	teamIDs := make([]string, len(teams))
	for i, team := range teams {
		teamIDs[i] = team.ID
	}

	// If odd number of teams, add a "bye" team
	hasBye := false
	if len(teamIDs)%2 == 1 {
		teamIDs = append(teamIDs, "BYE")
		hasBye = true
	}

	n := len(teamIDs)
	numRounds := n - 1
	matchesPerRound := n / 2

	matches := make([]models.Match, 0)
	currentDate := startDate

	for round := 0; round < numRounds; round++ {
		matchday := round + 1

		for i := 0; i < matchesPerRound; i++ {
			homeIdx := i
			awayIdx := n - 1 - i

			homeID := teamIDs[homeIdx]
			awayID := teamIDs[awayIdx]

			// Skip if it's a bye match
			if homeID == "BYE" || awayID == "BYE" {
				continue
			}

			match := models.Match{
				Matchday:   matchday,
				Date:       currentDate.Format("2006-01-02"),
				Time:       "20:00",
				Venue:      fmt.Sprintf("Field %d", (i%2)+1),
				HomeTeamID: homeID,
				AwayTeamID: awayID,
				HomeScore:  0,
				AwayScore:  0,
				Status:     models.MatchScheduled,
			}

			if err := db.Create(&match).Error; err != nil {
				return nil, err
			}

			matches = append(matches, match)
		}

		// Rotate teams (keep first team fixed, rotate others)
		// Move last element to position 1, shift others right
		last := teamIDs[n-1]
		for i := n - 1; i > 1; i-- {
			teamIDs[i] = teamIDs[i-1]
		}
		teamIDs[1] = last

		// Move to next day
		currentDate = currentDate.AddDate(0, 0, 1)
	}

	// If we had a bye, regenerate with second leg (home/away swap)
	if !hasBye {
		// Generate second leg (reverse fixtures)
		for round := 0; round < numRounds; round++ {
			matchday := numRounds + round + 1

			for i := 0; i < matchesPerRound; i++ {
				homeIdx := i
				awayIdx := n - 1 - i

				// Swap home and away for second leg
				homeID := teamIDs[awayIdx]
				awayID := teamIDs[homeIdx]

				match := models.Match{
					Matchday:   matchday,
					Date:       currentDate.Format("2006-01-02"),
					Time:       "20:00",
					Venue:      fmt.Sprintf("Field %d", (i%2)+1),
					HomeTeamID: homeID,
					AwayTeamID: awayID,
					HomeScore:  0,
					AwayScore:  0,
					Status:     models.MatchScheduled,
				}

				if err := db.Create(&match).Error; err != nil {
					return nil, err
				}

				matches = append(matches, match)
			}

			// Rotate teams
			last := teamIDs[n-1]
			for i := n - 1; i > 1; i-- {
				teamIDs[i] = teamIDs[i-1]
			}
			teamIDs[1] = last

			currentDate = currentDate.AddDate(0, 0, 1)
		}
	}

	return matches, nil
}

// ComputeStandings computes the league standings from finished matches
func ComputeStandings() ([]models.Standing, error) {
	db := database.GetDB()

	// Get all teams
	var teams []models.Team
	if err := db.Preload("Players").Find(&teams).Error; err != nil {
		return nil, err
	}

	// Get all finished matches
	var matches []models.Match
	if err := db.Where("status = ?", models.MatchFinished).Find(&matches).Error; err != nil {
		return nil, err
	}

	// Create team stats map
	type teamStats struct {
		played       int
		won          int
		drawn        int
		lost         int
		goalsFor     int
		goalsAgainst int
		points       int
		form         []string
	}

	statsMap := make(map[string]*teamStats)
	for _, team := range teams {
		statsMap[team.ID] = &teamStats{form: []string{}}
	}

	// Compute stats from matches
	for _, match := range matches {
		homeStats := statsMap[match.HomeTeamID]
		awayStats := statsMap[match.AwayTeamID]

		if homeStats != nil {
			homeStats.played++
			homeStats.goalsFor += match.HomeScore
			homeStats.goalsAgainst += match.AwayScore

			if match.HomeScore > match.AwayScore {
				homeStats.won++
				homeStats.points += 3
				homeStats.form = append(homeStats.form, "W")
			} else if match.HomeScore == match.AwayScore {
				homeStats.drawn++
				homeStats.points += 1
				homeStats.form = append(homeStats.form, "D")
			} else {
				homeStats.lost++
				homeStats.form = append(homeStats.form, "L")
			}
		}

		if awayStats != nil {
			awayStats.played++
			awayStats.goalsFor += match.AwayScore
			awayStats.goalsAgainst += match.HomeScore

			if match.AwayScore > match.HomeScore {
				awayStats.won++
				awayStats.points += 3
				awayStats.form = append(awayStats.form, "W")
			} else if match.AwayScore == match.HomeScore {
				awayStats.drawn++
				awayStats.points += 1
				awayStats.form = append(awayStats.form, "D")
			} else {
				awayStats.lost++
				awayStats.form = append(awayStats.form, "L")
			}
		}
	}

	// Build standings
	standings := make([]models.Standing, 0, len(teams))
	for _, team := range teams {
		stats := statsMap[team.ID]

		// Trim form to last 5
		form := stats.form
		if len(form) > 5 {
			form = form[len(form)-5:]
		}

		standing := models.Standing{
			Team:           team,
			Played:         stats.played,
			Won:            stats.won,
			Drawn:          stats.drawn,
			Lost:           stats.lost,
			GoalsFor:       stats.goalsFor,
			GoalsAgainst:   stats.goalsAgainst,
			GoalDifference: stats.goalsFor - stats.goalsAgainst,
			Points:         stats.points,
			Form:           form,
		}
		standings = append(standings, standing)
	}

	// Sort standings
	sortStandings(standings)

	// Add positions
	for i := range standings {
		standings[i].Position = i + 1
	}

	return standings, nil
}

// sortStandings sorts standings by points, then goal difference, then goals for
func sortStandings(standings []models.Standing) {
	for i := 0; i < len(standings); i++ {
		for j := i + 1; j < len(standings); j++ {
			swap := false
			if standings[j].Points > standings[i].Points {
				swap = true
			} else if standings[j].Points == standings[i].Points {
				if standings[j].GoalDifference > standings[i].GoalDifference {
					swap = true
				} else if standings[j].GoalDifference == standings[i].GoalDifference {
					if standings[j].GoalsFor > standings[i].GoalsFor {
						swap = true
					}
				}
			}
			if swap {
				standings[i], standings[j] = standings[j], standings[i]
			}
		}
	}
}

// GetTopScorers returns the top goal scorers
func GetTopScorers(limit int) ([]models.TopScorer, error) {
	db := database.GetDB()

	var players []models.Player
	if err := db.Where("goals > 0").Order("goals DESC").Limit(limit).Find(&players).Error; err != nil {
		return nil, err
	}

	topScorers := make([]models.TopScorer, 0, len(players))
	for _, player := range players {
		var team models.Team
		db.Select("name").First(&team, "id = ?", player.TeamID)

		topScorers = append(topScorers, models.TopScorer{
			Player:   player,
			TeamName: team.Name,
			Goals:    player.Goals,
		})
	}

	return topScorers, nil
}

// GetLeagueStats returns league statistics
func GetLeagueStats() (models.LeagueStats, error) {
	db := database.GetDB()

	var stats models.LeagueStats

	// Count teams
	db.Model(&models.Team{}).Count(&stats.TotalTeams)

	// Count matches
	db.Model(&models.Match{}).Count(&stats.TotalMatches)

	// Count by status
	db.Model(&models.Match{}).Where("status = ?", models.MatchFinished).Count(&stats.CompletedMatches)
	db.Model(&models.Match{}).Where("status = ?", models.MatchScheduled).Count(&stats.ScheduledMatches)
	db.Model(&models.Match{}).Where("status = ?", models.MatchLive).Count(&stats.LiveMatches)

	// Sum goals from finished matches
	var totalGoals int64
	db.Model(&models.Match{}).Where("status = ?", models.MatchFinished).
		Select("SUM(home_score + away_score)").Scan(&totalGoals)
	stats.TotalGoals = int(totalGoals)

	// Calculate average
	if stats.CompletedMatches > 0 {
		stats.AverageGoalsPerMatch = float64(stats.TotalGoals) / float64(stats.CompletedMatches)
	}

	return stats, nil
}

// GetMatchdayInfo returns information about each matchday
func GetMatchdayInfo() ([]models.MatchdayInfo, error) {
	db := database.GetDB()

	// Get unique matchdays
	var matchdays []int
	db.Model(&models.Match{}).Distinct("matchday").Pluck("matchday", &matchdays)

	infos := make([]models.MatchdayInfo, 0, len(matchdays))
	for _, md := range matchdays {
		var info models.MatchdayInfo
		info.Matchday = md

		db.Model(&models.Match{}).Where("matchday = ?", md).Count(&info.MatchesCount)
		db.Model(&models.Match{}).Where("matchday = ? AND status = ?", md, models.MatchFinished).Count(&info.CompletedCount)

		var goals int64
		db.Model(&models.Match{}).Where("matchday = ? AND status = ?", md, models.MatchFinished).
			Select("SUM(home_score + away_score)").Scan(&goals)
		info.TotalGoals = int(goals)

		infos = append(infos, info)
	}

	return infos, nil
}

// UpdateMatchScore updates a match score and recalculates team statistics
func UpdateMatchScore(matchID string, homeScore, awayScore int) error {
	db := database.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		// Get the match
		var match models.Match
		if err := tx.First(&match, "id = ?", matchID).Error; err != nil {
			return err
		}

		// Update match
		match.HomeScore = homeScore
		match.AwayScore = awayScore
		match.Status = models.MatchFinished

		if err := tx.Save(&match).Error; err != nil {
			return err
		}

		// Update player statistics based on events
		// This would be expanded based on match events

		return nil
	})
}

// ResetAllData resets all data (teams, players, matches)
func ResetAllData() error {
	db := database.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("1 = 1").Delete(&models.MatchEvent{}).Error; err != nil {
			return err
		}
		if err := tx.Where("1 = 1").Delete(&models.Match{}).Error; err != nil {
			return err
		}
		if err := tx.Where("1 = 1").Delete(&models.Player{}).Error; err != nil {
			return err
		}
		if err := tx.Where("1 = 1").Delete(&models.Team{}).Error; err != nil {
			return err
		}
		return nil
	})
}

// ResetMatches resets only matches and team statistics
func ResetMatches() error {
	db := database.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("1 = 1").Delete(&models.MatchEvent{}).Error; err != nil {
			return err
		}
		if err := tx.Where("1 = 1").Delete(&models.Match{}).Error; err != nil {
			return err
		}

		// Reset team stats
		if err := tx.Model(&models.Team{}).Updates(map[string]interface{}{
			"played":          0,
			"won":             0,
			"drawn":           0,
			"lost":            0,
			"goals_for":       0,
			"goals_against":   0,
			"goal_difference": 0,
			"points":          0,
			"form":            "",
		}).Error; err != nil {
			return err
		}

		return nil
	})
}
