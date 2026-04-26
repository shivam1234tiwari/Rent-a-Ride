import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );
};

export default Loader;