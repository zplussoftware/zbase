import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async getStats() {
    // Get total users count
    const totalUsers = await this.userService.count();
    
    // Get active users (can be extended based on your user entity properties)
    const activeUsers = await this.userService.countActive();
    
    // Add additional statistics using activity logs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Calculate new users today using the created date
    const recentUsers = await this.userService.findRecent(50);
    const newUsersToday = recentUsers.filter(user => 
      new Date(user.createdAt) >= todayStart
    ).length;
    
    // Count roles and permissions (mock data until we add these services)
    const totalRoles = 5; // Placeholder value
    const totalPermissions = 25; // Placeholder value
    
    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalRoles,
      totalPermissions
    };
  }

  async getActivityData() {
    // Get real activity logs from the database
    const recentLogs = await this.activityLogService.findRecent(10);
    
    // Convert logs to the expected activity format for the dashboard
    const activities = recentLogs.map(log => {
      // Determine activity type based on action
      let type = 'other';
      
      if (log.action === 'LOGIN') type = 'login';
      else if (log.action === 'LOGOUT') type = 'logout';
      else if (log.action === 'REGISTER') type = 'register';
      else if (log.action === 'USER_CREATE') type = 'user_created';
      else if (log.action === 'USER_UPDATE') type = 'user_updated';
      else if (log.action === 'USER_DELETE') type = 'user_deleted';
      else if (log.action.startsWith('ROLE_')) type = 'role_activity';
      else if (log.action.startsWith('PERMISSION_')) type = 'permission_activity';
      
      return {
        type,
        description: log.description,
        timestamp: log.createdAt,
        user: { 
          id: log.userId, 
          name: log.userName || 'Unknown User' 
        }
      };
    });
    
    // Get recent users for the dashboard
    const recentUsers = await this.userService.findRecent(5);
    
    // Generate activity timeline data (could be enhanced with real login counts)
    const timelineData = this.generateTimelineData(recentUsers);
    
    // Return the data needed for the dashboard
    return activities;
  }
  
  /**
   * Generate timeline data based on user creation dates
   * This is a helper method for getActivityData
   */
  private generateTimelineData(users: any[]) {
    // Create a map to track activities by date
    const timelineMap = new Map();
    
    // Get dates for the last 7 days
    const dates: string[] = []; // Explicitly type the array as string[]
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      dates.push(dateString);
      
      // Initialize timeline data for this date
      timelineMap.set(dateString, {
        date: dateString,
        registrations: 0,
        logins: 0,
        actions: 0
      });
    }
    
    // Count user registrations by date
    for (const user of users) {
      const userDate = new Date(user.createdAt).toISOString().split('T')[0];
      if (timelineMap.has(userDate)) {
        const data = timelineMap.get(userDate);
        data.registrations++;
        data.actions += 2; // Count registration as 2 actions (register + initial login)
      }
    }
    
    // Generate some random login data for demonstration
    // In a real app, this would come from actual login logs
    for (const dateString of timelineMap.keys()) {
      const data = timelineMap.get(dateString);
      // Generate random login count based partly on registration count
      data.logins = data.registrations * 2 + Math.floor(Math.random() * 10);
      // Add login counts to actions
      data.actions += data.logins;
    }
    
    // Convert map to array and sort by date
    return Array.from(timelineMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}