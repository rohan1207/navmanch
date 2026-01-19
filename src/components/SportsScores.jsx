'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { FaFootballBall, FaSpinner, FaClock, FaTrophy, FaExclamationCircle } from 'react-icons/fa';

const SportsScores = () => {
  const [selectedSport, setSelectedSport] = useState('cricket');
  const [liveScores, setLiveScores] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSportsData();
  }, [selectedSport]);

  const fetchSportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch live scores and upcoming matches in parallel
      const [liveResponse, upcomingResponse] = await Promise.allSettled([
        apiFetch(`/sports/${selectedSport}/livescores`),
        apiFetch(`/sports/${selectedSport}/upcoming`)
      ]);

      // Process live scores
      let liveMatches = [];
      if (liveResponse.status === 'fulfilled') {
        const liveData = liveResponse.value;
        // Sports Monk API v2 returns { data: [...] }
        // Sports Monk API v3 returns { data: [...] }
        liveMatches = liveData?.data || (Array.isArray(liveData) ? liveData : []);
      } else {
        console.error('Live scores error:', liveResponse.reason);
      }

      // Process upcoming matches
      let upcoming = [];
      if (upcomingResponse.status === 'fulfilled') {
        const upcomingData = upcomingResponse.value;
        upcoming = upcomingData?.data || (Array.isArray(upcomingData) ? upcomingData : []);
      } else {
        console.error('Upcoming matches error:', upcomingResponse.reason);
      }

      setLiveScores(Array.isArray(liveMatches) ? liveMatches : []);
      setUpcomingMatches(Array.isArray(upcoming) ? upcoming : []);
    } catch (err) {
      console.error('Error fetching sports data:', err);
      setError('डेटा लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      setLiveScores([]);
      setUpcomingMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCricketScore = (match) => {
    // Check if match has scoreboards or score data
    if (match.scoreboards && match.scoreboards.length > 0) {
      const scoreboard = match.scoreboards[0];
      const team1Score = scoreboard.scoreboard?.localteam?.score || '-';
      const team2Score = scoreboard.scoreboard?.visitorteam?.score || '-';
      const overs = scoreboard.scoreboard?.localteam?.overs || '';
      
      return {
        team1Score: team1Score !== '-' ? `${team1Score}${overs ? ` (${overs})` : ''}` : '-',
        team2Score: team2Score !== '-' ? `${team2Score}${overs ? ` (${overs})` : ''}` : '-',
        status: match.status || 'Live'
      };
    }
    
    // Check for direct score properties
    if (match.localteam_score || match.visitorteam_score) {
      return {
        team1Score: match.localteam_score || '-',
        team2Score: match.visitorteam_score || '-',
        status: match.status || 'Live'
      };
    }
    
    return { team1Score: '-', team2Score: '-', status: match.status || 'Upcoming' };
  };

  const formatFootballScore = (match) => {
    // Football API v3 structure
    const scores = match.scores || match.result_info || {};
    const homeScore = scores.home_score || scores.localteam_score || match.home_score || '-';
    const awayScore = scores.away_score || scores.visitorteam_score || match.away_score || '-';
    
    return {
      team1Score: homeScore,
      team2Score: awayScore,
      status: match.time?.status || match.status || 'Live'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTeamName = (match, isTeam1) => {
    if (selectedSport === 'cricket') {
      return isTeam1 
        ? (match.localteam?.name || match.localteam?.code || 'Team 1')
        : (match.visitorteam?.name || match.visitorteam?.code || 'Team 2');
    } else {
      // Football
      if (match.participants && Array.isArray(match.participants)) {
        const home = match.participants.find(p => p.meta?.location === 'home' || p.meta?.position === 'home');
        const away = match.participants.find(p => p.meta?.location === 'away' || p.meta?.position === 'away');
        return isTeam1 
          ? (home?.name || match.participants[0]?.name || 'Team 1')
          : (away?.name || match.participants[1]?.name || 'Team 2');
      }
      return isTeam1 ? 'Team 1' : 'Team 2';
    }
  };

  return (
    <div className="mb-10">
      {/* Sport Selection Dropdown */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-newsRed rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
            लाइव्ह स्कोअर आणि आगामी सामने
          </h2>
        </div>
        <div className="relative">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="appearance-none bg-cleanWhite border-2 border-subtleGray rounded-lg px-5 py-2.5 pr-12 text-deepCharcoal font-semibold focus:outline-none focus:ring-2 focus:ring-newsRed focus:border-newsRed cursor-pointer shadow-sm hover:border-newsRed/50 transition-colors"
          >
            <option value="cricket">क्रिकेट</option>
            <option value="football">फुटबॉल</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {selectedSport === 'cricket' ? (
              <FaTrophy className="w-5 h-5 text-newsRed" />
            ) : (
              <FaFootballBall className="w-5 h-5 text-newsRed" />
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-cleanWhite rounded-lg p-12 text-center border border-subtleGray/70 shadow-sm">
          <FaSpinner className="w-8 h-8 text-newsRed animate-spin mx-auto mb-4" />
          <p className="text-slateBody font-medium">डेटा लोड होत आहे...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center shadow-sm">
          <FaExclamationCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live Scores Section */}
          {liveScores.length > 0 ? (
            <section className="bg-cleanWhite rounded-lg border border-subtleGray/70 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-newsRed via-red-600 to-newsRed px-6 py-4">
                <h3 className="text-lg font-bold text-cleanWhite flex items-center gap-3">
                  <span className="w-3 h-3 bg-cleanWhite rounded-full animate-pulse shadow-lg"></span>
                  <span>लाइव्ह स्कोअर</span>
                  <span className="ml-auto text-sm font-normal bg-cleanWhite/20 px-3 py-1 rounded-full">
                    {liveScores.length} सामने
                  </span>
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {liveScores.map((match, index) => {
                  const scores = selectedSport === 'cricket' 
                    ? formatCricketScore(match) 
                    : formatFootballScore(match);
                  
                  const team1 = getTeamName(match, true);
                  const team2 = getTeamName(match, false);

                  return (
                    <div
                      key={match.id || `live-${index}`}
                      className="border-2 border-newsRed/20 rounded-lg p-5 hover:shadow-lg hover:border-newsRed/40 transition-all duration-300 bg-gradient-to-br from-subtleGray/30 to-cleanWhite"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-newsRed bg-newsRed/10 px-3 py-1.5 rounded-full uppercase tracking-wide">
                          {scores.status}
                        </span>
                        {match.venue?.name && (
                          <span className="text-xs text-metaGray font-medium">{match.venue.name}</span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-subtleGray/50">
                          <span className="font-bold text-base text-deepCharcoal">{team1}</span>
                          <span className="font-bold text-xl text-newsRed">{scores.team1Score}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="font-bold text-base text-deepCharcoal">{team2}</span>
                          <span className="font-bold text-xl text-newsRed">{scores.team2Score}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="bg-cleanWhite rounded-lg border border-subtleGray/70 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-subtleGray/50 to-subtleGray/30 px-6 py-4">
                <h3 className="text-lg font-bold text-deepCharcoal flex items-center gap-3">
                  <FaClock className="w-5 h-5 text-metaGray" />
                  <span>लाइव्ह स्कोअर</span>
                </h3>
              </div>
              <div className="p-8 text-center">
                <p className="text-slateBody">सध्या कोणतेही लाइव्ह सामने नाहीत</p>
              </div>
            </section>
          )}

          {/* Upcoming Matches Section */}
          {upcomingMatches.length > 0 ? (
            <section className="bg-cleanWhite rounded-lg border border-subtleGray/70 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-editorialBlue via-blue-600 to-editorialBlue px-6 py-4">
                <h3 className="text-lg font-bold text-cleanWhite flex items-center gap-3">
                  <FaClock className="w-5 h-5" />
                  <span>आगामी सामने</span>
                  <span className="ml-auto text-sm font-normal bg-cleanWhite/20 px-3 py-1 rounded-full">
                    {upcomingMatches.length} सामने
                  </span>
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {upcomingMatches.slice(0, 10).map((match, index) => {
                  const team1 = getTeamName(match, true);
                  const team2 = getTeamName(match, false);

                  return (
                    <div
                      key={match.id || `upcoming-${index}`}
                      className="border border-subtleGray/50 rounded-lg p-5 hover:shadow-md hover:border-editorialBlue/30 transition-all duration-300 bg-gradient-to-br from-cleanWhite to-subtleGray/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-metaGray font-medium">
                          <FaClock className="w-4 h-4 text-editorialBlue" />
                          <span>{formatDate(match.starting_at || match.date || match.starting_at)}</span>
                        </div>
                        {match.venue?.name && (
                          <span className="text-xs text-metaGray font-medium">{match.venue.name}</span>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-deepCharcoal">{team1}</span>
                          <span className="text-metaGray font-semibold text-sm">vs</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-deepCharcoal">{team2}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="bg-cleanWhite rounded-lg border border-subtleGray/70 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-subtleGray/50 to-subtleGray/30 px-6 py-4">
                <h3 className="text-lg font-bold text-deepCharcoal flex items-center gap-3">
                  <FaClock className="w-5 h-5 text-metaGray" />
                  <span>आगामी सामने</span>
                </h3>
              </div>
              <div className="p-8 text-center">
                <p className="text-slateBody">सध्या कोणतेही आगामी सामने नाहीत</p>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SportsScores;

