import React, { useState, useEffect } from 'react';
import { generateWorkouts } from './services/geminiService.ts';
import { FilterState, Workout, UserProfile, CompletedWorkout } from './types.ts';
import { authService, dbService } from './services/mockDatabase.ts';
import { FilterSheet } from './components/FilterSheet.tsx';
import { WorkoutCard } from './components/WorkoutCard.tsx';
import { ActiveWorkoutOverlay } from './components/ActiveWorkoutOverlay.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { ProfileScreen } from './components/ProfileScreen.tsx';
import { Button } from './components/Button.tsx';
import { Dumbbell, SlidersHorizontal, Flame, Bookmark, ArrowLeft, ChevronLeft, ChevronRight, Sparkles, User as UserIcon } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'MAIN' | 'PROFILE'>('MAIN');

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & History
  const [currentPage, setCurrentPage] = useState(1);
  const [generatedHistory, setGeneratedHistory] = useState<string[]>([]);
  
  // Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Default Filters
  const [filters, setFilters] = useState<FilterState>({
    equipment: ['None/Bodyweight'],
    equipmentWeights: {
      dumbbells: '',
      kettlebell: '',
      barbell: ''
    },
    time: 'Medium (20-30m)',
    difficulty: 'Intermediate',
    focus: ['Full Body'],
    bodyParts: [],
    runningSpace: 'Open Road/Track',
    minRating: 0,
    structure: 'Any'
  });

  // Listen to Auth Changes
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const [saved, history] = await Promise.all([
          dbService.getSavedWorkouts(currentUser.id),
          dbService.getWorkoutHistory(currentUser.id)
        ]);
        setSavedWorkouts(saved);
        setWorkoutHistory(history);
      } else {
        setUser(null);
        setSavedWorkouts([]);
        setWorkoutHistory([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setView('MAIN');
  };

  const handleGenerate = async (isNewBatch: boolean = false) => {
    setIsFilterOpen(false);
    setLoading(true);
    setError(null);
    setCurrentPage(1); 
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      let exclusions = generatedHistory;
      if (!isNewBatch) {
        exclusions = []; 
        setGeneratedHistory([]);
      }

      const result = await generateWorkouts(filters, exclusions);
      setWorkouts(result);
      
      const newNames = result.map(w => w.name);
      setGeneratedHistory(prev => isNewBatch ? [...prev, ...newNames] : newNames);

    } catch (err) {
      setError("Failed to generate workouts. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setWorkouts([]);
    setError(null);
    setGeneratedHistory([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveWorkout = async (id: string) => {
    if (!user) return;

    const isAlreadySaved = savedWorkouts.some(w => w.id === id);
    
    if (isAlreadySaved) {
      await dbService.removeWorkout(user.id, id);
      setSavedWorkouts(prev => prev.filter(w => w.id !== id));
    } else {
      const workoutToSave = workouts.find(w => w.id === id) || 
                            savedWorkouts.find(w => w.id === id) || 
                            workoutHistory.find(h => h.workout.id === id)?.workout;
      if (workoutToSave) {
        await dbService.saveWorkout(user.id, workoutToSave);
        setSavedWorkouts(prev => [...prev, workoutToSave]);
      }
    }
  };

  const handleWorkoutComplete = async (rating: number | undefined, shouldSave: boolean) => {
    if (!activeWorkout || !user) return;

    // Record in History
    await dbService.recordCompletedWorkout(user.id, activeWorkout, rating);

    // Save if requested
    if (shouldSave) {
      await dbService.saveWorkout(user.id, activeWorkout);
    }

    // Refresh state
    const [freshSaved, freshHistory] = await Promise.all([
      dbService.getSavedWorkouts(user.id),
      dbService.getWorkoutHistory(user.id)
    ]);
    
    setSavedWorkouts(freshSaved);
    setWorkoutHistory(freshHistory);
    setUser(prev => prev ? ({ ...prev, workoutsCompleted: prev.workoutsCompleted + 1 }) : null);

    setActiveWorkout(null);
  };

  const totalPages = Math.ceil(workouts.length / ITEMS_PER_PAGE);
  const currentWorkouts = workouts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Flame className="text-primary animate-bounce" size={48} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (view === 'PROFILE') {
    return (
      <ProfileScreen 
        user={user} 
        savedWorkouts={savedWorkouts}
        workoutHistory={workoutHistory}
        onUpdateUser={(u) => setUser(u)}
        onLogout={handleLogout}
        onBack={() => setView('MAIN')}
        onToggleSave={toggleSaveWorkout}
        onStartWorkout={setActiveWorkout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-20 sm:pb-10">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Flame className="text-primary" size={24} fill="currentColor" fillOpacity={0.2} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Metcon<span className="text-primary">Master</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setView('PROFILE')}
              className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors flex items-center gap-2 hover:bg-zinc-800 pr-3"
             >
                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center">
                   {user.avatarUrl ? <img src={user.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <UserIcon className="p-1" />}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user.name ? user.name.split(' ')[0] : 'Athlete'}</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        
        {workouts.length === 0 && !loading && !error && (
          <div className="text-center py-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="text-zinc-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to crush a Metcon, {user.name ? user.name.split(' ')[0] : 'Athlete'}?</h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              We know every Girl, Hero, and Benchmark WOD. Filter by your gear to find the perfect sweat session.
            </p>
            <div className="flex flex-row gap-3 justify-center w-full max-w-md mx-auto">
              <Button 
                size="md" 
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                className="flex-1 gap-2 border-zinc-800 bg-zinc-900/50 text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                <SlidersHorizontal size={16} />
                Dial It In
              </Button>
              <Button 
                size="md" 
                onClick={() => handleGenerate(false)}
                className="flex-1 gap-2 shadow-lg shadow-primary/20 text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                <Sparkles size={16} fill="currentColor" />
                Classic WODs
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
            {workouts.length > 0 && !loading && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleBackToHome}
                    className="p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Back to home"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-white">Suggested Metcons</h2>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full ml-2">
                    {workouts.length} results
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} className="gap-2">
                   <SlidersHorizontal size={16} /> Filters
                </Button>
              </div>
            )}

            {loading && (
              <div className="space-y-4 py-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-zinc-800 rounded-xl p-5 h-64 animate-pulse">
                    <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-zinc-800 rounded w-1/4 mb-6"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-zinc-800 rounded w-full"></div>
                      <div className="h-4 bg-zinc-800 rounded w-full"></div>
                    </div>
                  </div>
                ))}
                <div className="text-center space-y-2 animate-pulse">
                  <p className="text-zinc-400 font-medium">Scouring the WOD library...</p>
                  <p className="text-zinc-600 text-sm">Matching 25 workouts to your criteria.</p>
                </div>
              </div>
            )}

            {!loading && workouts.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6">
                  {currentWorkouts.map(workout => (
                    <WorkoutCard 
                      key={workout.id} 
                      workout={workout} 
                      onSave={toggleSaveWorkout}
                      isSaved={savedWorkouts.some(s => s.id === workout.id)}
                      onStart={setActiveWorkout}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center gap-4 py-6 border-t border-zinc-800 mt-6">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPrevPage} 
                      disabled={currentPage === 1}
                      className="w-24"
                    >
                      <ChevronLeft size={16} className="mr-1" /> Previous
                    </Button>
                    
                    <span className="text-zinc-400 text-sm font-medium">
                      Page <span className="text-white">{currentPage}</span> of {totalPages}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextPage} 
                      disabled={currentPage === totalPages}
                      className="w-24"
                    >
                        Next <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>

                  <div className="w-full max-w-xs border-t border-zinc-800 pt-6 mt-2">
                      <Button 
                        onClick={() => handleGenerate(true)} 
                        size="lg" 
                        className="w-full shadow-lg shadow-primary/20"
                      >
                        Find 25 More
                      </Button>
                  </div>
                </div>
              </>
            )}
            
            {error && (
              <div className="text-center py-10 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-red-400 mb-4">{error}</p>
                <div className="flex justify-center gap-3">
                  <Button onClick={handleBackToHome} variant="ghost">Go Back</Button>
                  <Button onClick={() => handleGenerate(false)} variant="outline">Try Again</Button>
                </div>
              </div>
            )}
        </div>

      </main>

      <FilterSheet 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => handleGenerate(false)}
      />

      {activeWorkout && (
        <ActiveWorkoutOverlay 
          workout={activeWorkout}
          onClose={() => setActiveWorkout(null)}
          onComplete={handleWorkoutComplete}
          isSavedInitial={savedWorkouts.some(w => w.id === activeWorkout.id)}
        />
      )}

    </div>
  );
};

export default App;