import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useModels } from "@/hooks/useMarketData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const AIInsights = () => {
  const { data: models, isLoading, error, refetch } = useModels();

  const accuracyData = models?.accuracy_history || []

  const featureImportance = models?.feature_importance || [];
  const modelList = models?.models ? Object.values(models.models) : [];

  if (error) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Model performance, feature importance, and training analytics</p>
        </div>
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-bearish mb-4" />
          <p className="text-muted-foreground mb-4">Failed to load AI models</p>
          <button onClick={() => refetch()} className="text-primary hover:underline">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Model performance, feature importance, and training analytics</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
        <p className="text-sm text-muted-foreground">Model performance, feature importance, and training analytics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Model Accuracy */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Model Accuracy (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 15%)" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[80, 100]} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: 'hsl(225, 35%, 10%)', border: '1px solid hsl(225, 20%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 96%)' }} />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(195, 100%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Feature Importance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 15%)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ background: 'hsl(225, 35%, 10%)', border: '1px solid hsl(225, 20%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 96%)' }} />
              <Bar dataKey="value" fill="hsl(195, 100%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model details */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {modelList.map((model) => (
          <div key={model.name} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">{model.name}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-bullish/20 text-bullish capitalize">{model.status}</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{model.accuracy.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
            {model.epochs && (
              <div className="text-xs text-muted-foreground mt-2">Epochs: {model.epochs}</div>
            )}
            {model.trees && (
              <div className="text-xs text-muted-foreground mt-2">Trees: {model.trees}</div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;