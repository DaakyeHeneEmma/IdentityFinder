interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pageName}
      </h2>

    </div>
  );
};

export default Breadcrumb;


{/* <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
<Link
  href={`/settings`}
  className="flex cursor-pointer items-center justify-center gap-2 
  rounded bg-primary px-2 py-1 text-sm font-medium text-white hover:bg-opacity-80 xsm:px-4"
>
  <span>Edit Profile</span>
</Link>
</div> */}