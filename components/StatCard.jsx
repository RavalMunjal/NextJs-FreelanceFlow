import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  href,
  colorScheme = "forest",
}) {
  // Color configuration
  const colorMap = {
    forest: {
      bg: "bg-forest/10",
      text: "text-forest",
      badge: "bg-forest/10 text-forest",
    },
    sage: {
      bg: "bg-sage-light",
      text: "text-sage-dark",
      badge: "bg-sage-light text-sage-dark",
    },
    copper: {
      bg: "bg-copper-light/20",
      text: "text-copper-dark",
      badge: "bg-copper-light/20 text-copper-dark",
    },
    terracotta: {
      bg: "bg-terracotta-light",
      text: "text-terracotta",
      badge: "bg-terracotta-light text-terracotta",
    },
    warning: {
      bg: "bg-warning-light",
      text: "text-warning",
      badge: "bg-warning-light text-warning",
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.forest;

  const CardWrapper = href ? Link : "div";

  return (
    <CardWrapper
      href={href || "#"}
      className={`block p-5 bg-white rounded-xl border border-cream-border card-shadow card-hover ${
        href ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-textColor-primary tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.bg} ${scheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend || href) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-border/60 text-xs">
          {subtitle && (
            <span className="text-textColor-secondary truncate">{subtitle}</span>
          )}
          {trend && (
            <span className={`font-medium ${trend.isPositive ? "text-sage-dark" : "text-terracotta"}`}>
              {trend.text}
            </span>
          )}
          {href && (
            <span className="flex items-center gap-0.5 text-forest font-semibold ml-auto hover:text-forest-light">
              View <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}
    </CardWrapper>
  );
}
