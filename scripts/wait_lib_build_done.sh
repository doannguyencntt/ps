#!/bin/bash
check_mw_version=$(npm view $MW_LIB versions | grep ${MW_VERSION:1} | wc -l)
check_rw_version=$(npm view $RW_LIB versions | grep ${RW_VERSION:1} | wc -l)
check_ra_version=$(npm view $RA_LIB versions | grep ${RA_VERSION:1} | wc -l)
check_mt_version=$(npm view $MT_LIB versions | grep ${MT_VERSION:1} | wc -l)
check_dc_version=$(npm view $DC_LIB versions | grep ${DC_VERSION:1} | wc -l)
check_sdk_version=$(npm view $SDK_LIB versions | grep ${SDK_VERSION:1} | wc -l)
check_plat_sdk_version=$(npm view $PLAT_SDK_LIB versions | grep ${PLAT_SDK_VERSION:1} | wc -l)
check_import_lib_version=$(npm view $IMPORT_LIB versions | grep ${IMPORT_LIB_VERSION:1} | wc -l)
counter=0
wait=600
while ((($check_mw_version == 0 || $check_rw_version == 0 || $check_ra_version == 0 || $check_dc_version == 0 || $check_mt_version == 0 || $check_sdk_version==0 || $check_plat_sdk_version==0 || $check_import_lib_version==0)&&($counter < $wait)));
do
	echo "Checking version for all lib. Please wait for a few minute..."
	sleep 10
	((counter+=10))
	check_mw_version=$(npm view $MW_LIB versions | grep ${MW_VERSION:1} | wc -l)
	check_rw_version=$(npm view $RW_LIB versions | grep ${RW_VERSION:1} | wc -l)
	check_ra_version=$(npm view $RA_LIB versions | grep ${RA_VERSION:1} | wc -l)
	check_mt_version=$(npm view $MT_LIB versions | grep ${MT_VERSION:1} | wc -l)
  check_dc_version=$(npm view $DC_LIB versions | grep ${DC_VERSION:1} | wc -l)
  check_sdk_version=$(npm view $SDK_LIB versions | grep ${SDK_VERSION:1} | wc -l)
  check_plat_sdk_version=$(npm view $PLAT_SDK_LIB versions | grep ${PLAT_SDK_VERSION:1} | wc -l)
  check_import_lib_version=$(npm view $IMPORT_LIB versions | grep ${IMPORT_LIB_VERSION:1} | wc -l)
done
if [[ $counter -eq $wait ]]
then
echo "Please check the library has built successfully yet? If not, please try again."
exit 1;
fi
echo "Done!"
