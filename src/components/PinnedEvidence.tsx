import { useState } from "react";
import { PinnedEvidence as PinnedEvidenceType } from "@/types/workspace";
import { mockProjects } from "@/data/mockResearch";
import { Pin, Search, Tag, X, ExternalLink, Plus, Check } from "lucide-react";

interface PinnedEvidenceProps {
  evidence: PinnedEvidenceType[];
  onRemove: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
}

const PinnedEvidence = ({ evidence, onRemove, onUpdateTags }: PinnedEvidenceProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState("");

  const filteredEvidence = evidence.filter(item => {
    const matchesSearch = item.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(evidence.flatMap(e => e.tags))];

  const handleAddTag = (itemId: string) => {
    if (newTagValue.trim()) {
      const item = evidence.find(e => e.id === itemId);
      if (item && !item.tags.includes(newTagValue.trim())) {
        onUpdateTags(itemId, [...item.tags, newTagValue.trim()]);
      }
      setNewTagValue("");
      setEditingTagId(null);
    }
  };

  const handleRemoveTag = (itemId: string, tagToRemove: string) => {
    const item = evidence.find(e => e.id === itemId);
    if (item) {
      onUpdateTags(itemId, item.tags.filter(t => t !== tagToRemove));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Pinned Evidence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your curated collection of research insights
        </p>

        {/* Search and filter */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pinned evidence..."
              className="w-full pl-10 pr-4 py-2 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                !selectedTag
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {evidence.length === 0 ? (
          <div className="text-center py-16">
            <Pin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No pinned evidence yet</h3>
            <p className="text-sm text-muted-foreground">
              Pin research projects from the Research Map to build your library.
            </p>
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {filteredEvidence.map(item => {
              const project = mockProjects.find(p => p.id === item.projectId);
              const isEditingThis = editingTagId === item.id;
              
              return (
                <div key={item.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.projectTitle}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Added {new Date(item.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {project && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.summary}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full group"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(item.id, tag)}
                          className="ml-0.5 hover:text-destructive transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    
                    {isEditingThis ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newTagValue}
                          onChange={(e) => setNewTagValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddTag(item.id);
                            if (e.key === "Escape") {
                              setEditingTagId(null);
                              setNewTagValue("");
                            }
                          }}
                          placeholder="Tag name..."
                          autoFocus
                          className="w-24 px-2 py-0.5 bg-secondary border-0 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={() => handleAddTag(item.id)}
                          disabled={!newTagValue.trim()}
                          className="p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTagId(null);
                            setNewTagValue("");
                          }}
                          className="p-1 bg-secondary text-muted-foreground rounded-full hover:bg-secondary/80 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingTagId(item.id);
                          setNewTagValue("");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full hover:bg-secondary/80 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        Add tag
                      </button>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3">
                      {item.notes}
                    </p>
                  )}

                  {project?.details.externalLink && (
                    <a
                      href={project.details.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-3"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View original
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PinnedEvidence;
