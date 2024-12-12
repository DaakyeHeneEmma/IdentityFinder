const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;


export const LoaderSmall = () => {
  return (
    <div className="flex items-center justify-center bg-white dark:bg-black mb-3">
      <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};




