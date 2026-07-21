import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Company, Job } from '../types';
import { Filter, Navigation, Compass, Search, MapPin, Sparkles } from 'lucide-react';

// Custom icons generator with clean inline styling to ensure no default leaflet styles persist
const createCompanyIcon = (jobsCount: number) => {
  const isHiring = jobsCount > 0;
  const colorClass = isHiring ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]';
  const ringClass = isHiring ? 'border-emerald-500/50 animate-ping' : 'border-indigo-500/30';
  
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
        <div class="absolute rounded-full ${ringClass}" style="width: 20px; height: 20px; border-width: 1.5px; border-style: solid; opacity: 0.65;"></div>
        <div class="rounded-full ${colorClass}" style="width: 10px; height: 10px; transition: transform 0.2s ease-in-out;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        <div class="absolute rounded-full animate-ping bg-sky-500/25" style="width: 32px; height: 32px; animation-duration: 2s;"></div>
        <div class="absolute rounded-full bg-sky-500/40" style="width: 18px; height: 18px;"></div>
        <div class="rounded-full bg-white shadow-lg border-2 border-sky-500" style="width: 10px; height: 10px;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Map view controller component to handle smooth camera fly-to animations
interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, zoom, map]);
  return null;
};

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
  else if (loc.includes('kawran') || loc.includes('karwan')) { baseLat = 23.7516; baseLng = 90.3938; }
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
  
  // Geolocation & Interactive Fly-to States
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.7925, 90.4078]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [locating, setLocating] = useState<boolean>(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Auto geolocate user on mount safely
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (err) => console.log("Iframe geolocation silent fallback:", err),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

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

  // Handle locating user explicitly on-demand
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser inside this container.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setLocating(false);
      },
      (error) => {
        console.warn("Could not retrieve precise location:", error);
        setLocating(false);
        // Fallback zoom-in on the center of Dhaka
        setMapCenter([23.7925, 90.4078]);
        setMapZoom(13);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Zoom map smoothly to selected company coordinate
  const handleSelectCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    if (!companyId) return;

    const marker = markers.find(m => m.company.id === companyId);
    if (marker) {
      setMapCenter(marker.coords);
      setMapZoom(15);
    }
  };

  return (
    <div className="bg-[#0A0C10] border border-[#161B22] rounded-xl overflow-hidden shadow-lg h-[600px] flex flex-col relative" id="interactive-cluster-map">
      <div className="p-4 border-b border-[#161B22] flex flex-col xl:flex-row xl:items-center justify-between bg-[#11161D] gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Interactive Dhaka Tech Cluster Map
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Explore geographical job hubs, filter tech stacks, and track your local alignment.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Company Search/Zoom Dropdown */}
          <div className="flex items-center gap-2 bg-[#070A0F] border border-[#161B22] px-3 py-1.5 rounded-lg">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCompanyId}
              onChange={(e) => handleSelectCompanyChange(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none w-36"
            >
              <option value="">Zoom to Company...</option>
              {markers.map(m => (
                <option key={m.company.id} value={m.company.id}>
                  {m.company.name} ({m.jobsCount} jobs)
                </option>
              ))}
            </select>
          </div>

          {/* Tech Stack filter */}
          <div className="flex items-center gap-2 bg-[#070A0F] border border-[#161B22] px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none w-32"
            >
              <option value="all">All Techs</option>
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

          {/* Locate Me Trigger */}
          <button
            onClick={handleLocateUser}
            disabled={locating}
            className="flex items-center gap-1.5 bg-[#1a1f26] border border-[#30363d] text-xs text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
            title="Locate my position in Dhaka tech hub"
          >
            <Compass className={`w-3.5 h-3.5 text-sky-400 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1.5 rounded font-mono border border-indigo-500/20">
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
          
          {/* Map camera center & zoom synchronization controller */}
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* User Location beacon */}
          {userLocation && (
            <Marker position={userLocation} icon={createUserIcon()}>
              <Popup>
                <div className="p-1 text-center">
                  <span className="font-bold text-xs text-indigo-900 block mb-0.5">Your Position</span>
                  <p className="text-[10px] text-slate-600 font-medium">Calibrating nearest IT workspace clusters...</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Plotted companies with custom neon interactive marker nodes */}
          {markers.map((marker, idx) => (
            <Marker 
              key={`${marker.company.id}-${idx}`} 
              position={marker.coords}
              icon={createCompanyIcon(marker.jobsCount)}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-800 leading-tight">{marker.company.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 font-medium">{marker.company.location}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                    {marker.jobsCount > 0 ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {marker.jobsCount} Active Openings
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                        No active jobs
                      </span>
                    )}
                  </div>

                  {marker.company.technologies && marker.company.technologies.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <p className="text-[9px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Primary Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {marker.company.technologies.slice(0, 4).map((t, idx) => (
                          <span key={`${t}-${idx}`} className="bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold">
                            {t}
                          </span>
                        ))}
                        {marker.company.technologies.length > 4 && (
                          <span className="bg-slate-50 border border-slate-200 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold">
                            +{marker.company.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Floating Quick Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-[#0D1117]/90 backdrop-blur-md border border-[#161B22] p-2.5 rounded-xl text-[10px] text-slate-400 space-y-1.5 shadow-xl max-w-[160px]">
          <p className="font-bold text-slate-300 uppercase tracking-wider text-[9px] border-b border-[#161B22] pb-1 mb-1">Map Node Legend</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" style={{ display: 'inline-block' }}></span>
            <span>Hiring Active Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" style={{ display: 'inline-block' }}></span>
            <span>Registered Core IT Partner</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" style={{ display: 'inline-block' }}></span>
              <span>Your Current Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
