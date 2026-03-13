"use client";

import { useState, useMemo } from "react";
import "../feature1.css";
import { ActivityMode, getLeaderboardUsers, TimeFilter } from "../data/leaderboardData";

export default function LeaderboardPanel() {
    const [mode, setMode] = useState<ActivityMode>("walk");
    const [activeTab, setActiveTab] = useState<TimeFilter>("daily");

    const users = useMemo(() => getLeaderboardUsers(mode, activeTab), [mode, activeTab]);

    const stats = useMemo(() => {
        const totalSquats = users.reduce((acc, u) => acc + u.squats, 0);
        return {
            participants: users.length,
            totalSquats: totalSquats,
        };
    }, [users]);

    const maxSquats = users.length > 0 ? users[0].squats : 1;

    return (
        <aside className="feature1-sidebar">
            <div className="lb-header">
                <div className="lb-header-top">
                    <h2>🏆 Leaderboard</h2>
                    <div className="lb-live-indicator">LIVE</div>
                </div>
                <p>Top performers in Bengaluru by activity type</p>
            </div>

            <div className="lb-tabs lb-tabs--mode">
                {(["walk", "cycle"] as const).map((activityMode) => (
                    <button
                        key={activityMode}
                        className={`lb-tab ${mode === activityMode ? "lb-tab--active" : ""}`}
                        onClick={() => setMode(activityMode)}
                    >
                        {activityMode === "walk" ? "By Walk" : "By Cycle"}
                    </button>
                ))}
            </div>

            <div className="lb-tabs">
                {(["daily", "weekly", "monthly", "overall"] as const).map((tab) => (
                    <button
                        key={tab}
                        className={`lb-tab ${activeTab === tab ? "lb-tab--active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="lb-list-wrapper">
                <div className="lb-list">
                    {users.map((user, idx) => {
                        const rank = idx + 1;
                        const progress = (user.squats / maxSquats) * 100;
                        return (
                            <div
                                key={user.id}
                                className={`lb-row ${rank === 1 ? "lb-row--gold" : rank === 2 ? "lb-row--silver" : rank === 3 ? "lb-row--bronze" : ""}`}
                            >
                                <div className={`lb-rank lb-rank--${rank}`}>
                                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                                </div>

                                <div className="lb-info">
                                    <div className="lb-username">{user.username}</div>
                                    <div className="lb-location">📍 {user.location}</div>
                                </div>

                                <div className="lb-squats">
                                    <div className="lb-squats-value">{user.squats.toLocaleString("en-IN")}</div>
                                    <div className="lb-squats-label">SQUATS</div>
                                </div>

                                <div className="lb-progress" style={{ width: `${progress}%` }} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="lb-footer">
                <div className="lb-footer-card">
                    <div className="lb-stat">
                        <div className="lb-stat-label">Active Users</div>
                        <div className="lb-stat-value">{stats.participants}</div>
                    </div>
                    <div className="lb-stat">
                        <div className="lb-stat-label">{mode === "walk" ? "Total Walk Squats" : "Total Cycle Squats"}</div>
                        <div className="lb-stat-value lb-stat-value--accent">
                            {stats.totalSquats.toLocaleString("en-IN")}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
