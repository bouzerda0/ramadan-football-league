package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MatchStatus represents the status of a match
type MatchStatus string

const (
	MatchScheduled MatchStatus = "scheduled"
	MatchLive      MatchStatus = "live"
	MatchFinished  MatchStatus = "finished"
	MatchPostponed MatchStatus = "postponed"
	MatchCancelled MatchStatus = "cancelled"
)

// PlayerPosition represents player position
type PlayerPosition string

const (
	PositionGK  PlayerPosition = "GK"
	PositionDEF PlayerPosition = "DEF"
	PositionMID PlayerPosition = "MID"
	PositionFWD PlayerPosition = "FWD"
)

// EventType represents match event type
type EventType string

const (
	EventGoal         EventType = "goal"
	EventOwnGoal      EventType = "ownGoal"
	EventYellowCard   EventType = "yellowCard"
	EventRedCard      EventType = "redCard"
	EventSubstitution EventType = "substitution"
)

// Team represents a football team
type Team struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	Name           string    `json:"name" gorm:"not null"`
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
	RegisteredAt   time.Time `json:"registeredAt"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`

	// Statistics (computed from matches)
	Played         int      `json:"played" gorm:"default:0"`
	Won            int      `json:"won" gorm:"default:0"`
	Drawn          int      `json:"drawn" gorm:"default:0"`
	Lost           int      `json:"lost" gorm:"default:0"`
	GoalsFor       int      `json:"goalsFor" gorm:"default:0"`
	GoalsAgainst   int      `json:"goalsAgainst" gorm:"default:0"`
	GoalDifference int      `json:"goalDifference" gorm:"default:0"`
	Points         int      `json:"points" gorm:"default:0"`
	FormString     string   `json:"-" gorm:"column:form;type:text"`
	Form           []string `json:"form" gorm:"-"`
	RamadanSpirit  int      `json:"ramadanSpirit" gorm:"default:0"`

	// Relationships
	Players []Player `json:"players" gorm:"foreignKey:TeamID;references:ID"`
}

// BeforeCreate generates UUID before creating a team
func (t *Team) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = "team_" + uuid.New().String()[:8]
	}
	if t.RegisteredAt.IsZero() {
		t.RegisteredAt = time.Now()
	}
	if t.PrimaryColor == "" {
		t.PrimaryColor = "#D4A018"
	}
	if t.SecondaryColor == "" {
		t.SecondaryColor = "#0B0F1C"
	}
	return nil
}

// AfterFind hook to parse FormString into Form slice
func (t *Team) AfterFind(tx *gorm.DB) error {
	if t.FormString != "" {
		t.Form = []string{}
		current := ""
		for _, c := range t.FormString {
			if c == ',' {
				if current != "" {
					t.Form = append(t.Form, current)
				}
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
	return nil
}

// BeforeSave hook to join Form slice into FormString
func (t *Team) BeforeSave(tx *gorm.DB) error {
	if len(t.Form) > 0 {
		result := ""
		for i, f := range t.Form {
			if i > 0 {
				result += ","
			}
			result += f
		}
		t.FormString = result
	}
	return nil
}

// Player represents a football player
type Player struct {
	ID           string         `json:"id" gorm:"primaryKey"`
	TeamID       string         `json:"teamId" gorm:"index"`
	Name         string         `json:"name" gorm:"not null"`
	Number       int            `json:"number"`
	Position     PlayerPosition `json:"position"`
	IsCaptain    bool           `json:"isCaptain" gorm:"default:false"`
	IsSubstitute bool           `json:"isSubstitute" gorm:"default:false"`

	// Statistics
	Goals         int `json:"goals" gorm:"default:0"`
	Assists       int `json:"assists" gorm:"default:0"`
	CleanSheets   int `json:"cleanSheets" gorm:"default:0"`
	YellowCards   int `json:"yellowCards" gorm:"default:0"`
	RedCards      int `json:"redCards" gorm:"default:0"`
	MatchesPlayed int `json:"matchesPlayed" gorm:"default:0"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BeforeCreate generates UUID before creating a player
func (p *Player) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = "player_" + uuid.New().String()[:8]
	}
	return nil
}

// MatchEvent represents an event in a match
type MatchEvent struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	MatchID        string    `json:"matchId" gorm:"index"`
	Minute         int       `json:"minute"`
	Type           EventType `json:"type"`
	PlayerID       string    `json:"playerId"`
	TeamID         string    `json:"teamId"`
	AssistPlayerID string    `json:"assistPlayerId,omitempty"`
	Description    string    `json:"description"`
	CreatedAt      time.Time `json:"createdAt"`
}

// BeforeCreate generates UUID before creating an event
func (e *MatchEvent) BeforeCreate(tx *gorm.DB) error {
	if e.ID == "" {
		e.ID = "event_" + uuid.New().String()[:8]
	}
	return nil
}

// Match represents a football match
type Match struct {
	ID         string      `json:"id" gorm:"primaryKey"`
	Matchday   int         `json:"matchday" gorm:"index"`
	Date       string      `json:"date"`
	Time       string      `json:"time"`
	Venue      string      `json:"venue"`
	HomeTeamID string      `json:"homeTeamId" gorm:"index"`
	AwayTeamID string      `json:"awayTeamId" gorm:"index"`
	HomeScore  int         `json:"homeScore" gorm:"default:0"`
	AwayScore  int         `json:"awayScore" gorm:"default:0"`
	Status     MatchStatus `json:"status" gorm:"default:'scheduled'"`
	Round      string      `json:"round"` // QF1, QF2, SF1, SF2, Final for knockout stages
	MVP        string      `json:"mvp"`
	CreatedAt  time.Time   `json:"createdAt"`
	UpdatedAt  time.Time   `json:"updatedAt"`

	// Relationships
	HomeTeam Team         `json:"homeTeam" gorm:"foreignKey:HomeTeamID;references:ID"`
	AwayTeam Team         `json:"awayTeam" gorm:"foreignKey:AwayTeamID;references:ID"`
	Events   []MatchEvent `json:"events" gorm:"foreignKey:MatchID;references:ID"`
}

// BeforeCreate generates UUID before creating a match
func (m *Match) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = "match_" + uuid.New().String()[:8]
	}
	return nil
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
	AutoUpdateMatches bool   `json:"autoUpdateMatches" gorm:"default:true"`
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

// Standing represents a team standing in the league
type Standing struct {
	Position       int      `json:"position"`
	Team           Team     `json:"team"`
	Played         int      `json:"played"`
	Won            int      `json:"won"`
	Drawn          int      `json:"drawn"`
	Lost           int      `json:"lost"`
	GoalsFor       int      `json:"goalsFor"`
	GoalsAgainst   int      `json:"goalsAgainst"`
	GoalDifference int      `json:"goalDifference"`
	Points         int      `json:"points"`
	Form           []string `json:"form"`
}

// DashboardData represents all data for the dashboard
type DashboardData struct {
	Config          SiteConfig     `json:"config"`
	Standings       []Standing     `json:"standings"`
	RecentMatches   []Match        `json:"recentMatches"`
	UpcomingMatches []Match        `json:"upcomingMatches"`
	LiveMatches     []Match        `json:"liveMatches"`
	TopScorers      []TopScorer    `json:"topScorers"`
	Stats           LeagueStats    `json:"stats"`
	Matchdays       []MatchdayInfo `json:"matchdays"`
}

// TopScorer represents a top goal scorer
type TopScorer struct {
	Player   Player `json:"player"`
	TeamName string `json:"teamName"`
	Goals    int    `json:"goals"`
}

// LeagueStats represents league statistics
type LeagueStats struct {
	TotalTeams           int64   `json:"totalTeams"`
	TotalMatches         int64   `json:"totalMatches"`
	CompletedMatches     int64   `json:"completedMatches"`
	ScheduledMatches     int64   `json:"scheduledMatches"`
	LiveMatches          int64   `json:"liveMatches"`
	TotalGoals           int     `json:"totalGoals"`
	AverageGoalsPerMatch float64 `json:"averageGoalsPerMatch"`
}

// MatchdayInfo represents information about a matchday
type MatchdayInfo struct {
	Matchday       int   `json:"matchday"`
	MatchesCount   int64 `json:"matchesCount"`
	CompletedCount int64 `json:"completedCount"`
	TotalGoals     int   `json:"totalGoals"`
}

// GenerateTeamsRequest represents a request to generate teams
type GenerateTeamsRequest struct {
	Count int `json:"count" binding:"required,min=2,max=20"`
}

// GenerateMatchesRequest represents a request to generate matches
type GenerateMatchesRequest struct {
	StartDate string `json:"startDate"`
}

// UpdateScoreRequest represents a request to update match score
type UpdateScoreRequest struct {
	HomeScore int `json:"homeScore" binding:"min=0"`
	AwayScore int `json:"awayScore" binding:"min:0"`
}

// LoginRequest represents admin login request
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// Moment represents a user-uploaded photo
type Moment struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	ImageURL  string    `json:"imageUrl"`
	Caption   string    `json:"caption"`
	Status    string    `json:"status" gorm:"default:'pending'"` // pending, approved, rejected
	CreatedAt time.Time `json:"createdAt"`
}

// BeforeCreate generates UUID before creating a moment
func (m *Moment) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = "moment_" + uuid.New().String()[:8]
	}
	return nil
}
