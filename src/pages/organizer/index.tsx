// src/pages/organizer/index.tsx

import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";



// ✅ shadcn breadcrumb components
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";


// Custom labels for the main organizer routes
const customLabels: { [key: string]: string } = {
    // Updated: The index route ('/organizer') is now Dashboard
    '/organizer': 'Dashboard', 
    // New: Contest list page
    '/organizer/contests': 'Contests',
    // '/organizer/org-dashboard' is now removed/obsolete
    '/organizer/create': 'Create Contest',
    '/organizer/create-problem': 'Create Problem',
    '/organizer/submissions': 'Submissions & Analytics',
};

// Helper function to convert a URL slug (e.g., 'profile-settings') to a friendly label ('Profile Settings')
const slugToLabel = (slug: string) => {
  // Replace hyphens with spaces, then capitalize the first letter of each word
  return slug
    .replace(/-/g, " ") 
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// ✅ Generate breadcrumb path dynamically from URL
function useBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  let curr = "";
  let breadcrumbs: { to: string; label: string }[] = [];

  segments.forEach((seg) => {
    curr += `/${seg}`;
    
    // Check for custom label first
    let label = customLabels[curr];
    
    if (!label) {
        // Fallback to dynamic slug conversion
        label = slugToLabel(seg);
    }

    breadcrumbs.push({
      to: curr,
      label: label,
    });
  });

  // Filter to only include organizer routes, starting from the base '/organizer'.
  const startIndex = breadcrumbs.findIndex(item => item.to === "/organizer");
  const filteredBreadcrumbs = startIndex >= 0 ? breadcrumbs.slice(startIndex) : [];
  
  return filteredBreadcrumbs;
}

const CustomBreadcrumb: React.FC = () => {
  const { pathname } = useLocation();
  const breadcrumbs = useBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="text-sm mb-6">
      <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-1">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.to}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  // ✅ Current page
                  <BreadcrumbPage className="text-xl font-semibold text-theme-primary">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  // ✅ Links
                  <BreadcrumbLink asChild>
                    <Link
                      to={crumb.to}
                      className="text-gray-500 hover:text-theme-primary transition-colors text-base"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {/* ✅ Separator */}
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator className="text-gray-400 mx-1">
                  /
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default function OrganizerLayout() {
 
 

  return (
    <div className="min-h-screen bg-theme-background">
      {/* ... (Header and Navigation are the same) ... */}
      
      <main className="container mx-auto p-4 md:p-8 pt-24">
        {/* Breadcrumbs are now prominently displayed at the top of the content area */}
        <CustomBreadcrumb />

        {/* ✅ Content Wrapper */}
        <div className="bg-theme-secondary  border-theme rounded-2xl  p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* ... (Footer is the same) ... */}
    </div>
  );
}