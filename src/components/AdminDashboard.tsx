import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  totalNovels: number;
  totalChapters: number;
  recentUsers: number;
}

interface UserByDate {
  date: string;
  count: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalNovels: 0,
    totalChapters: 0,
    recentUsers: 0,
  });
  const [usersByDate, setUsersByDate] = useState<UserByDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Fetch total novels
      const { count: novelsCount, error: novelsError } = await supabase
        .from("novels")
        .select("*", { count: "exact", head: true });

      if (novelsError) throw novelsError;

      // Fetch total chapters
      const { count: chaptersCount, error: chaptersError } = await supabase
        .from("chapters")
        .select("*", { count: "exact", head: true });

      if (chaptersError) throw chaptersError;

      // Fetch users from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentUsersCount, error: recentError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Fetch users by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (profilesError) throw profilesError;

      // Group users by date
      const usersByDateMap = new Map<string, number>();
      profilesData?.forEach((profile) => {
        const date = new Date(profile.created_at).toLocaleDateString("vi-VN");
        usersByDateMap.set(date, (usersByDateMap.get(date) || 0) + 1);
      });

      const usersByDateArray = Array.from(usersByDateMap.entries()).map(
        ([date, count]) => ({ date, count })
      );

      setStats({
        totalUsers: usersCount || 0,
        totalNovels: novelsCount || 0,
        totalChapters: chaptersCount || 0,
        recentUsers: recentUsersCount || 0,
      });

      setUsersByDate(usersByDateArray);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast.error("Không thể tải thống kê: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Người Dùng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.recentUsers} trong 7 ngày qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Truyện</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNovels}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Truyện đã đăng tải
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Chapter</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChapters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalNovels > 0
                ? `Trung bình ${Math.round(
                    stats.totalChapters / stats.totalNovels
                  )} chapter/truyện`
                : "Chưa có dữ liệu"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tăng Trưởng
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recentUsers > 0 ? "+" : ""}
              {stats.recentUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              User mới tuần này
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Registration Timeline */}
      {usersByDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Người Dùng Đăng Ký (30 ngày gần nhất)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usersByDate.slice(-10).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.date}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{ width: `${item.count * 20}px`, minWidth: "20px" }}
                    ></div>
                    <span className="text-sm font-medium w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;

