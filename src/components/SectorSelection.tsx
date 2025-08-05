import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Sector {
  id: string;
  name: string;
  nameSwahili: string;
  icon: string;
  description: string;
  descriptionSwahili: string;
}

const sectors: Sector[] = [
  {
    id: "audiovisual",
    name: "Audio Visual & Interactive Media",
    nameSwahili: "Mazungumzo na Midia Shirikishi",
    icon: "🎬",
    description: "Film, TV, gaming, digital content",
    descriptionSwahili: "Filamu, TV, michezo, maudhui ya kidijitali"
  },
  {
    id: "books",
    name: "Books and Press",
    nameSwahili: "Vitabu na Maandishi",
    icon: "📚",
    description: "Publishing, journalism, literature",
    descriptionSwahili: "Uchapishaji, uandishi wa habari, fasihi"
  },
  {
    id: "education",
    name: "Creative & Cultural Education",
    nameSwahili: "Elimu ya Ubunifu na Utamaduni",
    icon: "🎓",
    description: "Arts education, cultural training",
    descriptionSwahili: "Elimu ya sanaa, mafunzo ya kitamaduni"
  },
  {
    id: "infrastructure",
    name: "Cultural Infrastructure",
    nameSwahili: "Miundombinu ya Kitamaduni",
    icon: "🏛️",
    description: "Museums, galleries, cultural spaces",
    descriptionSwahili: "Makumbusho, maonyesho, maeneo ya kitamaduni"
  },
  {
    id: "heritage",
    name: "Cultural & Natural Heritage",
    nameSwahili: "Urithi wa Kitamaduni na Asili",
    icon: "🗿",
    description: "Heritage sites, cultural preservation",
    descriptionSwahili: "Maeneo ya urithi, uhifadhi wa utamaduni"
  },
  {
    id: "design",
    name: "Design & Creative Services",
    nameSwahili: "Ubunifu na Huduma za Ubunifu",
    icon: "🎨",
    description: "Graphic design, fashion, architecture",
    descriptionSwahili: "Ubunifu wa kielelezo, mavazi, ujenzi"
  },
  {
    id: "intangible",
    name: "Intangible Cultural Heritage",
    nameSwahili: "Urithi Usiopatikana wa Kitamaduni",
    icon: "🎭",
    description: "Traditional arts, folklore, customs",
    descriptionSwahili: "Sanaa za jadi, hadithi za kijadi, mila"
  },
  {
    id: "performance",
    name: "Performance & Celebration",
    nameSwahili: "Uigizaji na Sherehe",
    icon: "🎪",
    description: "Theater, music, dance, festivals",
    descriptionSwahili: "Uigizaji, muziki, ngoma, tamasha"
  },
  {
    id: "visual",
    name: "Visual Arts & Crafts",
    nameSwahili: "Sanaa za Kuona na Ufundi",
    icon: "🖼️",
    description: "Painting, sculpture, crafts, photography",
    descriptionSwahili: "Uchoraji, ufinyanzi, ufundi, picha"
  },
  {
    id: "animation",
    name: "Animation & Motion Graphics",
    nameSwahili: "Uhuishaji na Michoro ya Mwendo",
    icon: "🎞️",
    description: "2D/3D animation, motion graphics, visual effects",
    descriptionSwahili: "Uhuishaji wa 2D/3D, michoro ya mwendo, athari za kuona"
  },
  {
    id: "podcasting",
    name: "Podcasting & Radio Production",
    nameSwahili: "Uzalishaji wa Podikasti na Redio",
    icon: "🎙️",
    description: "Audio content, podcast production, radio shows",
    descriptionSwahili: "Maudhui ya sauti, uzalishaji wa podikasti, vipindi vya redio"
  },
  {
    id: "photography",
    name: "Photography",
    nameSwahili: "Upigaji Picha",
    icon: "📸",
    description: "Professional photography, photo journalism, commercial photography",
    descriptionSwahili: "Upigaji picha wa kitaaluma, uandishi wa picha, upigaji picha wa kibiashara"
  },
  {
    id: "publishing",
    name: "Comic & Book Publishing",
    nameSwahili: "Uchapishaji wa Vitabu na Katuni",
    icon: "📖",
    description: "Comic books, graphic novels, digital publishing",
    descriptionSwahili: "Vitabu vya katuni, riwaya za kielelezo, uchapishaji wa kidijitali"
  },
  {
    id: "gaming",
    name: "Gaming & Esports",
    nameSwahili: "Michezo na Esports",
    icon: "🎮",
    description: "Game development, esports, gaming content creation",
    descriptionSwahili: "Maendeleo ya michezo, esports, uundaji wa maudhui ya michezo"
  },
  {
    id: "product-design",
    name: "Digital Product Design",
    nameSwahili: "Ubunifu wa Bidhaa za Kidijitali",
    icon: "💻",
    description: "UI/UX design, app design, digital product development",
    descriptionSwahili: "Muundo wa UI/UX, muundo wa programu, maendeleo ya bidhaa za kidijitali"
  },
  {
    id: "traditional-crafts",
    name: "Artisan & Traditional Crafts",
    nameSwahili: "Ufundi wa Jadi na wa Kisasa",
    icon: "🪴",
    description: "Handmade crafts, traditional art, artisan products",
    descriptionSwahili: "Ufundi wa mikono, sanaa za jadi, bidhaa za ufundi"
  },
  {
    id: "cultural-tourism",
    name: "Cultural Tourism",
    nameSwahili: "Utalii wa Kitamaduni",
    icon: "🗺️",
    description: "Cultural tours, heritage tourism, experiential travel",
    descriptionSwahili: "Ziara za kitamaduni, utalii wa urithi, safari za uzoefu"
  },
  {
    id: "content-creation",
    name: "Content Creation",
    nameSwahili: "Uundaji wa Maudhui",
    icon: "🎬",
    description: "Social media content, influencer marketing, digital storytelling",
    descriptionSwahili: "Maudhui ya mitandao ya kijamii, uuzaji wa kivutio, hadithi za kidijitali"
  }
];

interface SectorSelectionProps {
  selectedSectors: string[];
  onSelectionChange: (sectors: string[]) => void;
  multiSelect?: boolean;
  language?: "en" | "sw";
  className?: string;
}

export const SectorSelection = ({
  selectedSectors,
  onSelectionChange,
  multiSelect = true,
  language = "en",
  className
}: SectorSelectionProps) => {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const handleSectorClick = (sectorId: string) => {
    if (multiSelect) {
      if (selectedSectors.includes(sectorId)) {
        onSelectionChange(selectedSectors.filter(id => id !== sectorId));
      } else {
        onSelectionChange([...selectedSectors, sectorId]);
      }
    } else {
      onSelectionChange([sectorId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-dark">
            {language === "en" ? "What's your creative focus?" : "Ni uwanja gani wa ubunifu wako?"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === "en" 
              ? multiSelect 
                ? "Select all sectors that apply to your creative business"
                : "Select your primary creative sector"
              : multiSelect
                ? "Chagua maeneo yote yanayohusiana na biashara yako ya ubunifu"
                : "Chagua uwanja wako mkuu wa ubunifu"
            }
          </p>
        </div>
        
        {multiSelect && selectedSectors.length > 0 && (
          <Button variant="outline" onClick={clearAll} size="sm">
            {language === "en" ? "Clear All" : "Ondoa Yote"}
          </Button>
        )}
      </div>

      {selectedSectors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSectors.map(sectorId => {
            const sector = sectors.find(s => s.id === sectorId);
            return sector ? (
              <Badge key={sectorId} variant="default" className="text-sm py-1">
                {sector.icon} {language === "en" ? sector.name : sector.nameSwahili}
              </Badge>
            ) : null;
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sector) => {
          const isSelected = selectedSectors.includes(sector.id);
          const isHovered = hoveredSector === sector.id;

          return (
            <Card
              key={sector.id}
              className={cn(
                "sector-card relative p-6 cursor-pointer transition-all duration-200",
                isSelected && "selected ring-2 ring-primary/30 bg-primary/5",
                "hover:shadow-lg hover:-translate-y-1"
              )}
              onClick={() => handleSectorClick(sector.id)}
              onMouseEnter={() => setHoveredSector(sector.id)}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={cn(
                  "text-4xl transition-transform duration-200",
                  isHovered && "scale-110"
                )}>
                  {sector.icon}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm leading-tight">
                    {language === "en" ? sector.name : sector.nameSwahili}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {language === "en" ? sector.description : sector.descriptionSwahili}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {multiSelect && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            {language === "en" 
              ? `${selectedSectors.length} sector${selectedSectors.length !== 1 ? 's' : ''} selected`
              : `Umechagua maeneo ${selectedSectors.length}`
            }
          </p>
        </div>
      )}
    </div>
  );
};