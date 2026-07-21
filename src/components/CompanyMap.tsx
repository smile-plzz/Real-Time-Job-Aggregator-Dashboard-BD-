import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Company, Job } from '../types';
import { Filter } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CompanyMapProps {
  companies: Company[];
  jobs: Job[];
}

const getApproximateCoords = (location: string, companyName: string): [number, number] => {
  const loc = location.toLowerCase();
  let baseLat = 23.8103;
  let baseLng = 90.4125;

  if (loc.includes('gulshan')) { baseLat = 23.7925; baseLng = 90.4078; }
  else if (loc.includes('banani')) { baseLat = 23.7940; baseLng = 90.4000; }
  else if (loc.includes('dhanmondi')) { baseLat = 23.7461; baseLng = 90.3742; }
  else if (loc.includes('mirpur')) { baseLat = 23.8223; baseLng = 90.3654; }
  else if (loc.includes('mohakhali')) { baseLat = 23.7776; baseLng = 90.4012; }
  else if (loc.includes('uttara')) { baseLat = 23.8728; baseLng = 90.3983; }
  else if (loc.includes('motijheel')) { baseLat = 23.7330; baseLng = 90.4172; }
  else if (loc.includes('kawran')) { baseLat = 23.7516; baseLng = 90.3938; }
  else if (loc.includes('badda')) { baseLat = 23.7805; baseLng = 90.4267; }
  else if (loc.includes('sylhet')) { baseLat = 24.8949; baseLng = 91.8687; }
  else if (loc.includes('chittagong')) { baseLat = 22.3569; baseLng = 91.7832; }

  // Add deterministic jitter based on company name to avoid perfect overlapping
  const hash = companyName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
  const jitterLat = (hash % 100) / 10000 - 0.005;
  const jitterLng = ((hash >> 8) % 100) / 10000 - 0.005;

  return [baseLat + jitterLat, baseLng + jitterLng];
};

export const CompanyMap: React.FC<CompanyMapProps> = ({ companies, jobs }) => {
  const [filterActiveJobs, setFilterActiveJobs] = useState(false);
  const [filterTech, setFilterTech] = useState<string>('all');

  const allTechs = useMemo(() => {
    const techSet = new Set<string>();
    companies.forEach(c => {
      if (c.technologies) {
        c.technologies.forEach(t => techSet.add(t));
      }
    });
    return Array.from(techSet).sort();
  }, [companies]);

  const markers = useMemo(() => {
    let filteredCompanies = companies.filter(c => c.location);
    
    if (filterActiveJobs) {
      filteredCompanies = filteredCompanies.filter(c => jobs.some(j => j.companyName === c.name));
    }

    if (filterTech !== 'all') {
      filteredCompanies = filteredCompanies.filter(c => 
        c.technologies && c.technologies.includes(filterTech)
      );
    }

    return filteredCompanies.map(company => {
      const coords = getApproximateCoords(company.location, company.name);
      const companyJobs = jobs.filter(j => j.companyName === company.name);
      return {
        company,
        coords,
        jobsCount: companyJobs.length
      };
    });
  }, [companies, jobs, filterActiveJobs, filterTech]);

  return (
    <div className="bg-[#0A0C10] border border-[#161B22] rounded-xl overflow-hidden shadow-lg h-[600px] flex flex-col">
      <div className="p-4 border-b border-[#161B22] flex flex-col sm:flex-row sm:items-center justify-between bg-[#11161D] gap-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Interactive Tech Cluster Map
        </h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#070A0F] border border-[#161B22] px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none w-32"
            >
              <option value="all">All Technologies</option>
              {allTechs.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
          
          <label className="flex items-center gap-2 bg-[#070A0F] border border-[#161B22] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#161B22]/50 transition-colors">
            <input 
              type="checkbox" 
              checked={filterActiveJobs}
              onChange={(e) => setFilterActiveJobs(e.target.checked)}
              className="rounded border-slate-600 bg-[#0A0C10] text-indigo-500 focus:ring-indigo-500/30 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-300 font-medium">Hiring Only</span>
          </label>

          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-mono border border-indigo-500/20">
            {markers.length} Plotted
          </span>
        </div>
      </div>
      <div className="flex-1 relative">
        <MapContainer center={[23.7925, 90.4078]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {markers.map((marker, idx) => (
            <Marker key={idx} position={marker.coords}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <h4 className="font-bold text-sm text-slate-800 mb-1">{marker.company.name}</h4>
                  <p className="text-xs text-slate-600 mb-2 truncate" title={marker.company.location}>{marker.company.location}</p>
                  
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {marker.jobsCount > 0 ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-medium">
                        {marker.jobsCount} Active Jobs
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                        No active jobs
                      </span>
                    )}
                  </div>
                  {marker.company.technologies && marker.company.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {marker.company.technologies.slice(0, 5).map((t, idx) => (
                        <span key={`${t}-${idx}`} className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-medium">
                          {t}
                        </span>
                      ))}
                      {marker.company.technologies.length > 5 && (
                        <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-medium">
                          +{marker.company.technologies.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
